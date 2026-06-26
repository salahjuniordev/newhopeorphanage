// Extracts <body> inner HTML + any <head><style> blocks from a legacy HTML
// page string and rewrites asset / nav paths so it works inside the SPA.

const PAGE_MAP: Record<string, string> = {
  "index.html": "/",
  "contact.html": "/contact",
  "donation.html": "/donation",
  "faqs.html": "/faqs",
  "team.html": "/team",
  "team-single.html": "/team-single",
  "video-gallery.html": "/video-gallery",
  "login.html": "/login",
  "dashboard.html": "/dashboard",
  "404.html": "/404",
};

function rewritePaths(html: string): string {
  let out = html;
  // Rewrite internal page links: href="contact.html" or href="./contact.html"
  for (const [file, route] of Object.entries(PAGE_MAP)) {
    const re = new RegExp(`href=(["'])(?:\\.\\/)?${file.replace(".", "\\.")}(["'#?])`, "g");
    out = out.replace(re, `href=$1${route}$2`);
  }
  // Asset folders → /legacy/...
  out = out.replace(/(["'(])(?:\.\/)?(images|videos|css|js)\//g, "$1/legacy/$2/");
  // Strip Cloudflare email-decode script artifacts (none of our scripts)
  out = out.replace(/<script[^>]*cloudflare[^<]*<\/script>/gi, "");
  return out;
}

export interface LegacyContent {
  styles: string; // concatenated inline <style> blocks from <head>
  body: string;   // inner HTML of <body>
}

export function extractLegacy(raw: string): LegacyContent {
  const headMatch = raw.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const headContent = headMatch ? headMatch[1] : "";
  const bodyContent = bodyMatch ? bodyMatch[1] : raw;

  // Collect inline <style> from head
  const styles = Array.from(headContent.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi))
    .map((m) => m[1])
    .join("\n");

  // Strip <script> tags in body — vendor scripts are loaded once in __root.
  let body = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, "");

  body = rewritePaths(body);

  return { styles, body };
}
