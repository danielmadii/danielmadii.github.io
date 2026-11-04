import { html, raw, join, slugify } from "./html.mjs";
import { inline } from "./markdown.mjs";
import { formatDate, machineDate } from "./dates.mjs";

export const pageHeader = ({ title, intro, crumb }) => html`
<header class="page-header">
  ${crumb ? html`<p class="crumb"><a href="${crumb.href}">${crumb.label}</a></p>` : ""}
  <h1>${title}</h1>
  ${intro ? html`<div class="page-intro">${Array.isArray(intro) ? intro.map((p) => html`<p>${inline(p)}</p>`) : html`<p>${inline(intro)}</p>`}</div>` : ""}
</header>`;

export const time = (value, text) => (value ? html`<time datetime="${machineDate(value)}">${text ?? formatDate(value)}</time>` : "");

export const section = ({ id, title, lead, body, cls = "" }) => {
  const sid = id || slugify(title);
  return html`
<section class="block ${cls}" id="${sid}" aria-labelledby="${sid}-title">
  <h2 class="block-title" id="${sid}-title">${title}</h2>
  ${lead ? html`<p class="block-lead">${inline(lead)}</p>` : ""}
  ${body}
</section>`;
};

export const facts = (items) => {
  const rows = items.filter((item) => item && item.value !== null && item.value !== undefined && item.value !== "" && !(Array.isArray(item.value) && !item.value.length));
  if (!rows.length) return "";
  return html`<dl class="facts">${rows.map((r) => html`<div class="fact"><dt>${r.label}</dt><dd>${r.value}</dd></div>`)}</dl>`;
};

export const inlineList = (items, cls = "inline-list") =>
  items && items.length ? html`<ul class="${cls}">${items.map((i) => html`<li>${i}</li>`)}</ul>` : "";

export const evidenceLinks = (links, label = "Where it shows up") =>
  links && links.length
    ? html`<p class="evidence"><span class="evidence-label">${label}:</span> ${join(
        links.map((l) => html`<a href="${l.href}">${l.label}</a>`),
        ", "
      )}</p>`
    : "";

export const filterBar = ({ scope, noun, categories, search = true }) => html`
<div class="filters" data-filter-controls="${scope}" data-noun="${noun}" hidden>
  ${search
    ? html`<div class="filter-search">
    <label for="${scope}-search">Search ${noun}</label>
    <input id="${scope}-search" type="search" autocomplete="off" spellcheck="false" data-filter-search placeholder="Type to filter, or press /">
  </div>`
    : ""}
  ${categories && categories.length > 1
    ? html`<div class="filter-cats" role="group" aria-label="Filter by category">
    <button type="button" data-filter-cat="" aria-pressed="true">All</button>
    ${categories.map((c) => html`<button type="button" data-filter-cat="${c.id}" aria-pressed="false">${c.name}</button>`)}
  </div>`
    : ""}
  <p class="filter-status" data-filter-status aria-live="polite"></p>
</div>`;

export const emptyState = (scope, noun) => html`
<div class="empty" data-filter-empty="${scope}" hidden>
  <p>No ${noun} match this search.</p>
  <button type="button" class="text-button" data-filter-reset="${scope}">Clear search and filters</button>
</div>`;

export const SEVERITY_NAMES = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  informational: "Informational",
  unrated: "Unrated",
};

export const severityBadge = (severity) => html`<span class="badge badge-sev badge-sev-${severity}">${SEVERITY_NAMES[severity]}</span>`;

export const evidenceBadge = (level) => html`<span class="badge badge-evidence badge-evidence-${level.id}">${level.name}</span>`;

export const picture = ({ src, alt, width, height, cls = "", sizes, loading = "lazy" }) => html`
<picture class="${cls}">
  <source type="image/webp" srcset="${src}.webp">
  <img src="${src}.jpg" alt="${alt}" width="${width}" height="${height}" loading="${loading}" decoding="async"${sizes ? raw(` sizes="${sizes}"`) : ""}>
</picture>`;
