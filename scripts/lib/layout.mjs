import { html, raw, esc } from "./html.mjs";
import { formatLongDate } from "./dates.mjs";

export const NAV = [
  { href: "/", label: "Overview" },
  { href: "/experience/", label: "Experience" },
  { href: "/projects/", label: "Projects" },
  { href: "/expertise/", label: "Expertise" },
  { href: "/security/", label: "Security" },
  { href: "/writing/", label: "Writing" },
  { href: "/certifications/", label: "Certifications" },
  { href: "/updates/", label: "Updates" },
  { href: "/cv/", label: "CV" },
];

const THEME_BOOT = `(function(){var d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")d.dataset.theme=t;}catch(e){}})();`;

const isCurrent = (itemHref, path) => (itemHref === "/" ? path === "/" : path.startsWith(itemHref));

const header = (path) => html`
<a class="skip-link" href="#main">Skip to content</a>
<header class="masthead">
  <div class="masthead-inner">
    <div class="masthead-tools">
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" hidden>Menu</button>
      <button class="theme-toggle" type="button" hidden>
        <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor"/></svg>
        <span class="theme-toggle-label">Dark theme</span>
      </button>
    </div>
    <nav class="site-nav" id="site-nav" aria-label="Main">
      <ul>
        ${NAV.map(
          (item) =>
            html`<li><a href="${item.href}"${isCurrent(item.href, path) ? raw(' aria-current="page"') : ""}>${item.label}</a></li>`
        )}
      </ul>
    </nav>
  </div>
</header>`;

const footer = (ctx) => html`
<footer class="colophon">
  <div class="colophon-inner">
    <p>© ${ctx.buildDate.getUTCFullYear()} Daniel Madi</p>
    <ul class="colophon-links">
      <li><a href="mailto:${ctx.site.email}">Email</a></li>
      <li><a href="https://github.com/danielmadii">GitHub</a></li>
      <li><a href="https://www.linkedin.com/in/danielmadi/">LinkedIn</a></li>
      <li><a href="/feed.xml">RSS</a></li>
    </ul>
    <p class="colophon-build">Static HTML generated from JSON and Markdown in <a href="${ctx.site.repository}">the site repository</a>. Built <time datetime="${ctx.buildDate.toISOString()}">${formatLongDate(ctx.buildDate)}</time>.</p>
  </div>
</footer>`;

export const page = (ctx, { path, title, description, main, jsonld, ogType = "website", ogImage, bodyClass = "" }) => {
  const url = ctx.site.url + path;
  const fullTitle = path === "/" ? `${ctx.site.name} — AI, infrastructure and security engineering` : `${title} — ${ctx.site.name}`;
  const desc = description || ctx.site.description;
  const image = ctx.site.url + (ogImage || "/assets/img/og-card.png");
  const ld = jsonld ? (Array.isArray(jsonld) ? jsonld : [jsonld]) : [];
  return `<!doctype html>
${html`<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000">
<script>${raw(THEME_BOOT)}</script>
<link rel="stylesheet" href="${ctx.assets.css}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="Daniel Madi: updates" href="/feed.xml">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${ctx.site.name}">
<meta property="og:title" content="${path === "/" ? ctx.site.name : title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Daniel Madi: AI, infrastructure and security engineering">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@danielmadii">
${ld.map((item) => html`<script type="application/ld+json">${raw(JSON.stringify(item).replace(/</g, "\\u003c"))}</script>
`)}<script src="${ctx.assets.js}" defer></script>
</head>
<body${bodyClass ? raw(` class="${esc(bodyClass)}"`) : ""}>
${header(path)}
<main id="main" class="page" tabindex="-1">
${main}
</main>
${footer(ctx)}
</body>
</html>`}
`;
};
