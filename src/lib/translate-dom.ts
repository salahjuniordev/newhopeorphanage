// Runtime English → French translator that walks DOM text nodes + a few
// user-visible attributes and swaps them using the AI-generated dictionary in
// `fr-dict.json`. Safe to call repeatedly; stores originals on the node so we
// can revert when the user switches back to English.

import dict from "./fr-dict.json";

type Dict = Record<string, string>;
const FR: Dict = dict as Dict;

// Also match trimmed variants (whitespace only): build a lowercased lookup.
const LC: Dict = {};
for (const [k, v] of Object.entries(FR)) LC[k.toLowerCase()] = v;

const ORIG_TEXT = "__nhoOrigText";
const ORIG_ATTR = "__nhoOrigAttr_";
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"]);
const ATTRS = ["placeholder", "title", "aria-label", "alt", "value"];

function translatePhrase(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Skip pure numbers / phone / email
  if (/^[\d\s.+\-()#*,]+$/.test(trimmed)) return null;
  const hit = FR[trimmed] ?? LC[trimmed.toLowerCase()];
  if (!hit || hit === trimmed) return null;
  // Preserve leading/trailing whitespace
  const lead = raw.match(/^\s*/)?.[0] ?? "";
  const tail = raw.match(/\s*$/)?.[0] ?? "";
  return lead + hit + tail;
}

export function applyLang(root: HTMLElement, lang: "en" | "fr") {
  if (typeof window === "undefined") return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let node: Node | null = walker.currentNode;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (SKIP_TAGS.has(el.tagName)) {
        node = walker.nextSibling() || walker.nextNode();
        continue;
      }
      for (const a of ATTRS) {
        const cur = el.getAttribute(a);
        if (cur == null) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const store = (el as any)[ORIG_ATTR + a] as string | undefined;
        if (lang === "en") {
          if (store != null) el.setAttribute(a, store);
        } else {
          const src = store ?? cur;
          const t = translatePhrase(src);
          if (t) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (store == null) (el as any)[ORIG_ATTR + a] = cur;
            el.setAttribute(a, t);
          }
        }
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const tn = node as Text;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const store = (tn as any)[ORIG_TEXT] as string | undefined;
      const raw = store ?? tn.nodeValue ?? "";
      if (lang === "en") {
        if (store != null) tn.nodeValue = store;
      } else {
        const t = translatePhrase(raw);
        if (t) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (store == null) (tn as any)[ORIG_TEXT] = raw;
          tn.nodeValue = t;
        }
      }
    }
    node = walker.nextNode();
  }
}
