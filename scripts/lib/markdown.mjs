import { Marked } from "marked";
import { raw, slugify, isExternal, esc } from "./html.mjs";

const HEADING_ID = /^(#{1,6})\s+(.+?)\s+\{#([A-Za-z0-9_-]+)\}\s*$/gm;

const createMarked = (ids) =>
  new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth, text }) {
        const id = ids.get(text) ?? slugify(text);
        const inner = this.parser.parseInline(tokens);
        return `<h${depth} id="${esc(id)}">${inner}</h${depth}>\n`;
      },
      table(token) {
        const header = token.header.map((cell) => `<th scope="col">${this.parser.parseInline(cell.tokens)}</th>`).join("");
        const rows = token.rows
          .map((row) => `<tr>${row.map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join("")}</tr>`)
          .join("\n");
        return `<div class="table-wrap"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const titleAttr = title ? ` title="${esc(title)}"` : "";
        const rel = isExternal(href) && !href.startsWith("mailto:") ? ' rel="noopener"' : "";
        return `<a href="${esc(href)}"${titleAttr}${rel}>${text}</a>`;
      },
    },
  });

export const markdown = (source, { blocks = {} } = {}) => {
  const ids = new Map();
  const prepared = String(source ?? "").replace(HEADING_ID, (_, hashes, text, id) => {
    ids.set(text, id);
    return `${hashes} ${text}`;
  });
  let out = createMarked(ids).parse(prepared);
  out = out.replace(/<p>\{\{([a-z]+):([a-z0-9-]+)\}\}<\/p>/g, (match, kind, name) => {
    const key = `${kind}:${name}`;
    if (!(key in blocks)) throw new Error(`Unknown block {{${key}}} in Markdown content.`);
    return String(blocks[key]);
  });
  return raw(out);
};

export const inline = (source) => raw(createMarked(new Map()).parseInline(String(source ?? "")));

export const plain = (source) =>
  String(source ?? "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "");
