const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export class Raw {
  constructor(value) {
    this.value = String(value ?? "");
  }
  toString() {
    return this.value;
  }
}

export const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);

export const raw = (value) => (value instanceof Raw ? value : new Raw(value));

const renderValue = (value) => {
  if (value === null || value === undefined || value === false) return "";
  if (value instanceof Raw) return value.value;
  if (Array.isArray(value)) return value.map(renderValue).join("");
  return esc(value);
};

export const html = (strings, ...values) =>
  new Raw(strings.reduce((out, str, i) => out + str + (i < values.length ? renderValue(values[i]) : ""), ""));

export const join = (items, separator = "") => new Raw(items.map(renderValue).join(renderValue(separator)));

export const slugify = (text) =>
  String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const isExternal = (href) => /^(https?:)?\/\//.test(href || "") || /^mailto:/.test(href || "");
