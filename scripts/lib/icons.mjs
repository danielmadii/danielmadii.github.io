import { raw } from "./html.mjs";

/* Line icons on a 24px grid, drawn with currentColor so they follow the theme. */
const LINE = {
  spark: '<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 15.5l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z"/>',
  wave: '<path d="M4 10v4M8 6.5v11M12 3.5v17M16 7.5v9M20 10.5v3"/>',
  bolt: '<path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12z"/>',
  server: '<rect x="3.5" y="4" width="17" height="6.5" rx="2"/><rect x="3.5" y="13.5" width="17" height="6.5" rx="2"/><path d="M7.5 7.25h.01M7.5 16.75h.01"/>',
  link: '<path d="M10 13.5a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10.5a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>',
  cloud: '<path d="M7 18.5a4.25 4.25 0 0 1-.6-8.46A6 6 0 0 1 17.9 9a4.75 4.75 0 0 1-.4 9.5z"/>',
  code: '<path d="M8.5 7l-5 5 5 5M15.5 7l5 5-5 5"/>',
  shield: '<path d="M12 3l7.5 2.8v5.7c0 4.6-3.2 7.9-7.5 9.5-4.3-1.6-7.5-4.9-7.5-9.5V5.8z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  rss: '<path d="M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14"/><circle cx="6" cy="18" r="1"/>',
};

/* Filled brand marks. */
const FILLED = {
  github: { box: "0 0 16 16", d: "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" },
  linkedin: { box: "0 0 24 24", d: "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" },
  x: { box: "0 0 24 24", d: "M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z" },
};

export const icon = (name, cls = "icon") => {
  if (FILLED[name]) {
    const { box, d } = FILLED[name];
    return raw(`<svg class="${cls}" viewBox="${box}" aria-hidden="true" focusable="false"><path fill="currentColor" d="${d}"/></svg>`);
  }
  return raw(`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${LINE[name] || LINE.spark}</svg>`);
};

/* Picks an icon for a domain or link from the words in its label. */
const BY_WORD = [
  [/security|cyber/i, "shield"],
  [/voice|real-time/i, "wave"],
  [/automation|agents and/i, "bolt"],
  [/backend|database/i, "server"],
  [/integration/i, "link"],
  [/devops|infrastructure|cloud/i, "cloud"],
  [/software/i, "code"],
  [/\bai\b|llm/i, "spark"],
];
export const iconFor = (label) => (BY_WORD.find(([re]) => re.test(label)) || [null, "spark"])[1];

export const linkIcon = (label, href = "") => {
  if (/github/i.test(label)) return "github";
  if (/linkedin/i.test(label)) return "linkedin";
  if (/^x$/i.test(label)) return "x";
  if (/^mailto:/.test(href)) return "mail";
  if (/\.pdf$/i.test(href)) return "download";
  return "external";
};
