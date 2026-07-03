import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

async function callerIsAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}


/**
 * Grants the "admin" role to the caller if the platform has no admins yet.
 * This is the bootstrap path for the first administrator.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (countErr) throw new Error(countErr.message);
    if ((count ?? 0) > 0) throw new Error("An admin already exists.");

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Admin-only: fetch every registered user with their email + roles.
 * Uses the service role because auth.users is not readable via RLS.
 */
export const listAllUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const isAdmin = await callerIsAdmin(context.supabase, context.userId);
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: usersData, error: usersErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (usersErr) throw new Error(usersErr.message);

    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name, phone, avatar_url"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const roleMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role as string);
      roleMap.set(r.user_id, arr);
    }

    return usersData.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      full_name: profileMap.get(u.id)?.full_name ?? null,
      phone: profileMap.get(u.id)?.phone ?? null,
      avatar_url: profileMap.get(u.id)?.avatar_url ?? null,
      roles: roleMap.get(u.id) ?? [],
    }));
  });

/**
 * Admin-only: send an invitation email so a person can create an account
 * and automatically receive the invited role on signup.
 */
export const inviteAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; role: "admin" | "moderator" }): { email: string; role: "admin" | "moderator" } => {
    const email = String(input.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
    const role: "admin" | "moderator" = input.role === "moderator" ? "moderator" : "admin";
    return { email, role };
  })
  .handler(async ({ data, context }) => {
    const isAdmin = await callerIsAdmin(context.supabase, context.userId);
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Record invitation (upsert on (email, role))
    const { data: inv, error: invErr } = await supabaseAdmin
      .from("admin_invitations")
      .upsert(
        { email: data.email, role: data.role, invited_by: context.userId, accepted_at: null },
        { onConflict: "email,role" },
      )
      .select()
      .single();
    if (invErr) throw new Error(invErr.message);

    // Try to invite via Supabase Auth (sends email); if user already exists, that's fine.
    try {
      await supabaseAdmin.auth.admin.inviteUserByEmail(data.email);
    } catch {
      /* non-fatal */
    }

    // If the user already exists, grant the role now.
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    const match = existing?.users.find(
      (u) => (u.email ?? "").toLowerCase() === data.email,
    );
    if (match) {
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: match.id, role: data.role })
        .then(() => undefined, () => undefined);
      await supabaseAdmin
        .from("admin_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", inv.id);
    }

    return { ok: true, invitation: inv };
  });

/** Admin-only: grant a role to a user. */
export const grantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; role: "admin" | "moderator" | "user" }) => ({
    userId: String(input.userId),
    role: input.role as "admin" | "moderator" | "user",
  }))
  .handler(async ({ data, context }) => {
    const isAdmin = await callerIsAdmin(context.supabase, context.userId);
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

/** Admin-only: revoke a role from a user. Prevents removing your own last admin role. */
export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; role: "admin" | "moderator" | "user" }) => ({
    userId: String(input.userId),
    role: input.role,
  }))
  .handler(async ({ data, context }) => {
    const isAdmin = await callerIsAdmin(context.supabase, context.userId);
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.role === "admin" && data.userId === context.userId) {
      const { count } = await supabaseAdmin
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) throw new Error("You are the last admin.");
    }
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", data.role);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin-only: revoke a pending invitation. */
export const revokeInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input.id) }))
  .handler(async ({ data, context }) => {
    const isAdmin = await callerIsAdmin(context.supabase, context.userId);
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("admin_invitations")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin-only: delete a contact message. */
export const deleteContactMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input.id) }))
  .handler(async ({ data, context }) => {
    const isAdmin = await callerIsAdmin(context.supabase, context.userId);
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("contact_messages")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
