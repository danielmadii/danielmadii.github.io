import { html, raw, join, esc, isExternal } from "./lib/html.mjs";
import { inline, markdown, plain } from "./lib/markdown.mjs";
import { formatDate, formatRange, sortKey, toDate, rfc822, isoDate } from "./lib/dates.mjs";
import { blocks } from "./lib/diagrams.mjs";
import { icon, iconFor, linkIcon } from "./lib/icons.mjs";
import {
  pageHeader, section, facts, inlineList, evidenceLinks, filterBar, emptyState,
  severityBadge, evidenceBadge, picture, time, SEVERITY_NAMES,
} from "./lib/components.mjs";

const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const searchText = (...parts) => parts.flat().filter(Boolean).map((p) => plain(p)).join(" ").toLowerCase();

/* ---------- Overview ---------- */

const homeSection = ({ id, eyebrow, title, lead, body, more }) => html`
<section class="home-section reveal" id="${id}" aria-labelledby="${id}-title">
  <header class="home-section-head">
    ${eyebrow ? html`<p class="eyebrow">${eyebrow}</p>` : ""}
    <h2 class="home-section-title" id="${id}-title">${title}</h2>
    ${lead ? html`<p class="home-section-lead">${lead}</p>` : ""}
  </header>
  ${body}
  ${more ? html`<p class="more-link"><a href="${more.href}">${more.label} ${icon("arrow")}</a></p>` : ""}
</section>`;

/* Headline numbers, all counted from content/ so they stay true as it changes. */
const stats = (ctx, c) => {
  const firstJob = Math.min(...c.experience.work.map((e) => toDate(e.start).getTime()));
  const years = Math.floor((ctx.buildDate.getTime() - firstJob) / (365.25 * 864e5));
  const liveProducts = c.projects.filter((p) => p.status === "Live" && !p.sites).length;
  const liveSites = c.projects.flatMap((p) => p.sites || []).filter((s) => s.href).length;
  const earned = c.certifications.credentials.filter((cr) => !cr.in_progress && cr.kind !== "training").length;
  const tech = c.skills.groups.flatMap((g) => g.items || g.subgroups.flatMap((s) => s.items)).length;
  return [
    { value: `${years}+`, label: "years shipping software" },
    { value: liveProducts + liveSites, label: "live products and client sites" },
    { value: earned, label: "security and AI credentials earned" },
    { value: tech, label: "technologies in production use" },
  ];
};

export const overview = (ctx, c) => {
  const { site } = c;
  const featured = c.projects.filter((p) => p.featured);
  const evidence = byId(c.security.evidence_levels);
  const [lede, ...about] = site.intro;
  const cv = site.links.find((l) => /\.pdf$/.test(l.href));

  const main = html`
<section class="hero" aria-labelledby="intro-title">
  <div class="hero-text">
    <p class="status-pill"><span class="status-dot" aria-hidden="true"></span>${inline(site.currently[0].text)}</p>
    <h1 id="intro-title" class="hero-name">${site.name}</h1>
    <p class="hero-tag">AI, infrastructure and security engineering.</p>
    <p class="hero-lede">${inline(lede)}</p>
    <div class="hero-actions">
      <a class="button button-primary" href="/projects/">See my work ${icon("arrow")}</a>
      ${cv ? html`<a class="button button-secondary" href="${cv.href}">${icon("download")} Download CV</a>` : ""}
    </div>
    <ul class="social-links" aria-label="Profiles">${site.links.filter((l) => l !== cv).map(
      (l) => html`<li><a href="${l.href}" aria-label="${l.label}" title="${l.label}">${icon(linkIcon(l.label, l.href))}</a></li>`
    )}</ul>
  </div>
  <div class="hero-portrait">
    ${picture({ src: site.portrait.src, alt: site.portrait.alt, width: 480, height: 480, cls: "portrait", loading: "eager" })}
  </div>
</section>

<ul class="stats reveal" aria-label="At a glance">${stats(ctx, c).map(
  (s) => html`<li class="stat"><span class="stat-value">${s.value}</span><span class="stat-label">${s.label}</span></li>`
)}</ul>

${homeSection({
  id: "about",
  eyebrow: "About",
  title: "Engineering that holds up in production.",
  body: html`<div class="about-grid">
    <div class="about-text">${about.map((p) => html`<p>${inline(p)}</p>`)}</div>
    <aside class="card now-card" aria-labelledby="now-title">
      <h3 class="card-eyebrow" id="now-title">Right now</h3>
      <ul class="now-list">${site.currently.map(
        (item) => html`<li><span class="now-when">${item.since ? html`Since ${time(item.since)}` : "In progress"}</span><span>${inline(item.text)}</span></li>`
      )}</ul>
    </aside>
  </div>`,
})}

${homeSection({
  id: "domains",
  eyebrow: "Capabilities",
  title: "What I work on",
  lead: "Each area links to the project or role where the work is documented.",
  body: html`<ul class="bento">${site.domains.map(
    (d) => html`<li class="card domain-card">
      <span class="domain-icon">${icon(iconFor(d.name))}</span>
      <h3 class="domain-name">${d.name}</h3>
      <p class="domain-summary">${d.summary}</p>
      ${d.evidence && d.evidence.length ? html`<p class="domain-links">${join(d.evidence.map((l) => html`<a href="${l.href}">${l.label}</a>`), " ")}</p>` : ""}
    </li>`
  )}</ul>`,
})}

${homeSection({
  id: "selected-projects",
  eyebrow: "Selected work",
  title: "Projects",
  body: html`<ul class="project-grid">${featured.map((p) => projectCard(p))}</ul>`,
  more: { href: "/projects/", label: "All projects" },
})}

${homeSection({
  id: "experience-summary",
  eyebrow: "Career",
  title: "Experience",
  body: html`<ol class="career">${c.experience.work.map(
    (e) => html`<li class="career-item">
      <span class="career-dot${e.end ? "" : " career-dot-live"}" aria-hidden="true"></span>
      <p class="career-when">${formatRange(e.start, e.end)}</p>
      <h3 class="career-role"><a href="/experience/#${e.id}">${e.role}</a></h3>
      <p class="career-org">${e.organization}${e.location ? html` · ${e.location}` : ""}</p>
      ${e.summary ? html`<p class="career-summary">${inline(e.summary)}</p>` : ""}
    </li>`
  )}</ol>`,
  more: { href: "/experience/", label: "Full experience, education and volunteering" },
})}

<div class="split reveal">
  <section class="card split-card" id="security-research" aria-labelledby="security-research-title">
    <p class="eyebrow">${icon("shield")} Security research</p>
    <h2 class="split-title" id="security-research-title">Reported findings</h2>
    <ul class="finding-list">${c.security.findings.map(
      (f) => html`<li><p class="finding-badges">${severityBadge(f.severity)} ${evidenceBadge(evidence[f.evidence])}</p><h3 class="finding-title"><a href="/security/${f.slug}/">${f.title}</a></h3><p class="finding-summary">${f.summary}</p></li>`
    )}</ul>
    <p class="more-link"><a href="/security/">Findings, practice and study ${icon("arrow")}</a></p>
  </section>
  <section class="card split-card" id="recent-updates" aria-labelledby="recent-updates-title">
    <p class="eyebrow">${icon("rss")} Updates</p>
    <h2 class="split-title" id="recent-updates-title">Recently</h2>
    <ul class="update-list">${c.updates.slice(0, 5).map((u) => html`<li><span class="update-when">${time(u.date)}</span><span>${inline(u.text)}</span></li>`)}</ul>
    <p class="more-link"><a href="/updates/">All updates ${icon("arrow")}</a></p>
  </section>
</div>

<section class="cta reveal" aria-labelledby="cta-title">
  <h2 class="cta-title" id="cta-title">Let's talk.</h2>
  <p class="cta-lead">Email is the fastest way to reach me, about AI systems, integrations, infrastructure or security.</p>
  <div class="hero-actions">
    <a class="button button-primary" href="mailto:${site.email}">${icon("mail")} ${site.email}</a>
    <a class="button button-secondary" href="https://www.linkedin.com/in/danielmadi/">${icon("linkedin")} LinkedIn</a>
  </div>
</section>`;

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url + "/",
    image: site.url + site.portrait.src + ".jpg",
    jobTitle: site.jobTitle,
    description: site.description,
    worksFor: site.worksFor.map((o) => ({ "@type": "Organization", name: o.name, ...(o.url ? { url: o.url } : {}) })),
    alumniOf: site.alumniOf.map((name) => ({ "@type": "EducationalOrganization", name })),
    address: { "@type": "PostalAddress", addressCountry: "LB" },
    sameAs: site.links.filter((l) => /^https:/.test(l.href)).map((l) => l.href),
  };
  return { path: "/", title: site.name, description: site.description, main, jsonld: [person, { "@context": "https://schema.org", "@type": "WebSite", name: site.name, url: site.url + "/" }], ogType: "profile", bodyClass: "page-home" };
};

/* ---------- Rows and cards shared between pages ---------- */

const projectCard = (p, { filterable = false, headingLevel = 3 } = {}) => {
  const Tag = `h${headingLevel}`;
  const attrs = filterable ? raw(` data-filter-item data-cats="${esc(p.categories.join(" "))}" data-text="${esc(searchText(p.title, p.summary, p.type, p.stack, p.tags))}"`) : "";
  const chips = (p.stack && p.stack.length ? p.stack : p.tags || []).slice(0, 6);
  return html`<li class="card project-card"${attrs}>
  <div class="project-body">
    <p class="project-kicker">${p.status === "Live" ? html`<span class="live-dot"></span>Live · ` : ""}${p.type}${p.period ? html` · ${formatRange(p.period.start, p.period.end)}` : ""}</p>
    ${raw(`<${Tag} class="project-title">`)}<a class="stretched" href="/projects/${p.slug}/">${p.title}</a>${raw(`</${Tag}>`)}
    <p class="project-summary">${p.summary}</p>
    ${chips.length ? html`<ul class="chips">${chips.map((s) => html`<li>${s}</li>`)}</ul>` : ""}
    <p class="project-links"><span class="project-cta">${p.bodySource ? "Read the case study" : "Details"} ${icon("arrow")}</span>${p.links?.live ? html`<a class="lifted" href="${p.links.live}">Live site ${icon("external")}</a>` : ""}${p.links?.repo ? html`<a class="lifted" href="${p.links.repo}">${icon("github")} Source</a>` : ""}</p>
  </div>
</li>`;
};

const updateRow = (u, c, { filterable = false } = {}) => {
  const cats = byId(c.updateCategories);
  const attrs = filterable ? raw(` data-filter-item data-cats="${esc(u.category)}" data-text="${esc(searchText(u.text, cats[u.category].name))}"`) : "";
  return html`<li class="row"${attrs}>
  <div class="row-meta">${time(u.date)}<span class="row-meta-sub">${cats[u.category].name}</span></div>
  <div class="row-body"><p>${inline(u.text)}${u.ref ? html` <a class="ref" href="${u.ref.href}">${u.ref.label}</a>` : ""}</p></div>
</li>`;
};

/* ---------- Experience ---------- */

const timeline = (ctx, exp) => {
  const start = Date.UTC(2019, 0, 1);
  const end = Date.UTC(ctx.buildDate.getUTCFullYear() + 1, 0, 1);
  const now = ctx.buildDate.getTime();
  const pct = (t) => (((Math.min(t, end) - start) / (end - start)) * 100).toFixed(2);
  const orgCount = {};
  [...exp.work, ...exp.other, ...exp.volunteering].forEach((e) => (orgCount[e.organization] = (orgCount[e.organization] || 0) + 1));
  const label = (e) => (orgCount[e.organization] > 1 ? `${e.organization}, ${e.role}` : e.organization);
  const groups = [
    { name: "Work", cls: "tl-work", items: exp.work.concat(exp.other).map((e) => ({ label: label(e), detail: e.role, start: e.start, end: e.end })) },
    { name: "Education", cls: "tl-edu", items: exp.education.map((e) => ({ label: e.institution, detail: e.credential, start: e.start, end: e.end, open: e.status === "In progress" })) },
    { name: "Volunteering", cls: "tl-vol", items: exp.volunteering.map((e) => ({ label: label(e), detail: e.role, start: e.start, end: e.end })) },
  ];
  const years = [];
  for (let y = 2019; y <= ctx.buildDate.getUTCFullYear(); y++) years.push(y);
  const bar = (item) => {
    const s = toDate(item.start).getTime();
    const rawEnd = item.end ? toDate(item.end, { end: true }).getTime() : now;
    const ongoing = !item.end || item.open || rawEnd > now;
    const e = Math.min(rawEnd, now);
    const left = pct(s);
    const width = Math.max(Number(pct(e)) - Number(left), 0.9).toFixed(2);
    return html`<span class="tl-bar${ongoing ? " tl-ongoing" : ""}" style="left:${left}%;width:${width}%"></span>`;
  };
  return html`
<figure class="timeline">
  <div class="tl-grid" aria-hidden="true">
    <span class="tl-axis">${years.map((y) => html`<span class="tl-year" style="left:${pct(Date.UTC(y, 0, 1))}%">${y}</span>`)}</span>
  </div>
  <ul class="tl-rows">
    ${groups.map(
      (g) => html`<li class="tl-group ${g.cls}"><span class="tl-group-name">${g.name}</span>
      <ul>${g.items.map(
        (item) => html`<li class="tl-row"><span class="tl-label">${item.label}<span class="visually-hidden">: ${item.detail}, ${formatRange(item.start, item.open ? null : item.end)}</span></span><span class="tl-track" aria-hidden="true">${years.map((y) => html`<span class="tl-tick" style="left:${pct(Date.UTC(y, 0, 1))}%"></span>`)}${bar(item)}</span></li>`
      )}</ul></li>`
    )}
  </ul>
  <figcaption>Work, education and volunteering since 2019. Bars that reach the right edge are ongoing.</figcaption>
</figure>`;
};

const experienceEntry = (e, headingLevel = 3) => html`
<article class="entry" id="${e.id}">
  <div class="row-meta">${formatRange(e.start, e.end)}</div>
  <div class="row-body">
    ${raw(`<h${headingLevel} class="entry-org">`)}${e.url ? html`<a href="${e.url}">${e.organization}</a>` : e.organization}${raw(`</h${headingLevel}>`)}
    <p class="entry-role">${e.role}</p>
    ${[e.type, e.location].filter(Boolean).length ? html`<p class="entry-facts">${[e.type, e.location].filter(Boolean).map((x) => html`<span>${x}</span>`)}</p>` : ""}
    ${e.summary ? html`<p>${inline(e.summary)}</p>` : ""}
    ${e.responsibilities && e.responsibilities.length ? html`<h4 class="entry-sub">Responsibilities</h4><ul class="bullets">${e.responsibilities.map((r) => html`<li>${inline(r)}</li>`)}</ul>` : ""}
    ${e.contributions && e.contributions.length ? html`<h4 class="entry-sub">Technical contributions</h4><ul class="bullets">${e.contributions.map((r) => html`<li>${inline(r)}</li>`)}</ul>` : ""}
    ${e.technologies && e.technologies.length ? html`<p class="entry-tech"><span class="evidence-label">Technologies:</span> ${e.technologies.join(", ")}</p>` : ""}
  </div>
</article>`;

export const experience = (ctx, c) => {
  const exp = c.experience;
  const main = html`
${pageHeader({
  title: "Experience",
  intro: "Professional roles first, then education, other work and volunteering. Two roles currently run in parallel: engineering lead at Meta Empires and Technical Integration Engineer at Layout Intl.",
})}
${timeline(ctx, exp)}
${section({ id: "work", title: "Professional experience", body: exp.work.map((e) => experienceEntry(e)) })}
${section({
  id: "education",
  title: "Education",
  body: exp.education.map(
    (e) => html`<article class="entry" id="${e.id}">
  <div class="row-meta">${formatRange(e.start, e.end)}</div>
  <div class="row-body">
    <h3 class="entry-org">${e.institution}</h3>
    <p class="entry-role">${e.credential}${e.status ? html` <span class="tag">${e.status}</span>` : ""}</p>
    ${e.summary ? html`<p>${e.summary}</p>` : ""}
  </div>
</article>`
  ),
})}
${exp.other.length ? section({ id: "other", title: "Other experience", body: exp.other.map((e) => experienceEntry(e)) }) : ""}
${exp.volunteering.length ? section({ id: "volunteering", title: "Volunteering", body: exp.volunteering.map((e) => experienceEntry(e)) }) : ""}
${section({
  id: "languages",
  title: "Languages",
  body: html`<ul class="rows rows-compact">${exp.languages.map((l) => html`<li class="row"><div class="row-meta">${l.language}</div><div class="row-body"><p>${l.level}</p></div></li>`)}</ul>`,
})}`;
  return { path: "/experience/", title: "Experience", description: "Daniel Madi's professional experience in AI engineering, systems integration, infrastructure and software engineering, with education and volunteering.", main };
};

/* ---------- Projects ---------- */

export const projectsIndex = (ctx, c) => {
  const used = new Set(c.projects.flatMap((p) => p.categories));
  const cats = c.projectCategories.filter((cat) => used.has(cat.id));
  const main = html`
${pageHeader({
  title: "Projects",
  intro: "Products, open-source work and client platforms, newest first. Each entry says what kind of work it was: a company product, an open-source project or client work.",
})}
<div class="filterable" data-filter-root="projects">
  ${filterBar({ scope: "projects", noun: "projects", categories: cats })}
  <ul class="project-grid">${c.projects.map((p) => projectCard(p, { filterable: true, headingLevel: 2 }))}</ul>
  ${emptyState("projects", "projects")}
</div>`;
  return { path: "/projects/", title: "Projects", description: "Technical projects by Daniel Madi: AI products, voice and conversational systems, full-stack applications and client web platforms.", main, bodyClass: "page-wide" };
};

export const projectDetail = (ctx, c, p) => {
  const cats = byId(c.projectCategories);
  const linkList = [
    p.links?.live && html`<a href="${p.links.live}">Live site</a>`,
    p.links?.repo && html`<a href="${p.links.repo}">Source code</a>`,
    p.links?.docs && html`<a href="${p.links.docs}">Documentation</a>`,
  ].filter(Boolean);
  const main = html`
<article class="doc">
  ${pageHeader({ title: p.title, intro: p.summary, crumb: { href: "/projects/", label: "Projects" } })}
  ${facts([
    { label: "Type", value: p.type },
    { label: "Role", value: p.role },
    { label: "Period", value: p.period ? formatRange(p.period.start, p.period.end) : null },
    { label: "Status", value: p.status },
    { label: "Areas", value: p.categories.map((id) => cats[id].name).join(", ") },
    { label: "Topics", value: (p.tags || []).join(", ") },
    { label: "Stack", value: (p.stack || []).join(", ") },
    { label: "Links", value: linkList.length ? join(linkList, ", ") : p.repository_note || null },
    { label: "Source", value: linkList.length && p.repository_note ? p.repository_note : null },
  ])}
  ${p.image ? html`<figure class="figure">${picture({ ...p.image, cls: "figure-img" })}</figure>` : ""}
  ${p.bodySource ? html`<div class="prose">${markdown(p.bodySource, { blocks: blocks() })}</div>` : ""}
  ${p.sites && p.sites.length
    ? html`<section class="block" id="sites" aria-labelledby="sites-title"><h2 class="block-title" id="sites-title">Sites</h2><ul class="bullets sites">${p.sites.map(
        (s) => html`<li><strong>${s.href ? html`<a href="${s.href}">${s.name}</a>` : s.name}</strong>. ${s.summary}${s.href ? "" : html` <span class="tag">Offline</span>`}</li>`
      )}</ul></section>`
    : ""}
  <p class="more"><a href="/projects/">All projects</a></p>
</article>`;
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.title,
    description: p.summary,
    url: `${c.site.url}/projects/${p.slug}/`,
    author: { "@type": "Person", name: c.site.name, url: c.site.url + "/" },
    ...(p.links?.repo ? { codeRepository: p.links.repo } : {}),
    keywords: [...(p.tags || []), ...(p.stack || [])].join(", "),
  };
  return { path: `/projects/${p.slug}/`, title: p.title, description: p.summary, main, jsonld, ogType: "article" };
};

/* ---------- Expertise ---------- */

export const expertise = (ctx, c) => {
  const main = html`
${pageHeader({
  title: "Expertise",
  intro: "The technologies I work with, grouped by what they're for. Each group links to the projects or roles where the work is documented.",
})}
<nav class="toc" aria-label="Expertise groups"><ul>${c.skills.groups.map((g) => html`<li><a href="#${g.id}">${g.name}</a></li>`)}</ul></nav>
${c.skills.groups.map((g) =>
  section({
    id: g.id,
    title: g.name,
    lead: g.description,
    body: html`${g.items ? inlineList(g.items, "skill-list") : ""}
    ${g.subgroups ? g.subgroups.map((s) => html`<h3 class="skill-sub">${s.name}</h3>${inlineList(s.items, "skill-list")}`) : ""}
    ${evidenceLinks(g.evidence)}`,
  })
)}`;
  return { path: "/expertise/", title: "Expertise", description: "Daniel Madi's technical expertise: AI and LLM engineering, voice AI, automation, backend and databases, infrastructure and cybersecurity.", main };
};

/* ---------- Security ---------- */

export const securityIndex = (ctx, c) => {
  const levels = byId(c.security.evidence_levels);
  const used = new Set(c.security.findings.map((f) => f.evidence));
  const main = html`
${pageHeader({
  title: "Security",
  intro: [
    "Security findings I have reported, the security work I do on production systems, and what I'm studying.",
    "Every finding carries an evidence level, so a reported issue is never presented as a confirmed one, and independent research is never presented as either.",
  ],
})}
${section({
  id: "findings",
  title: "Findings",
  body: html`<div class="table-wrap"><table class="findings">
    <thead><tr><th scope="col">Finding</th><th scope="col">Severity</th><th scope="col">Evidence</th><th scope="col">Disclosure</th></tr></thead>
    <tbody>${c.security.findings.map(
      (f) => html`<tr><th scope="row"><a href="/security/${f.slug}/">${f.title}</a><span class="cell-sub">${f.affected}</span></th><td>${severityBadge(f.severity)}</td><td>${evidenceBadge(levels[f.evidence])}</td><td>${f.disclosure?.status ?? ""}</td></tr>`
    )}</tbody>
  </table></div>`,
})}
${section({
  id: "evidence-levels",
  title: "Evidence levels",
  body: html`<dl class="legend">${c.security.evidence_levels.map(
    (l) => html`<div class="legend-item${used.has(l.id) ? "" : " legend-unused"}"><dt>${evidenceBadge(l)}</dt><dd>${l.description}</dd></div>`
  )}</dl>
  <p class="quiet small">Severity follows the usual scale: ${join(c.security.severities.map((s) => severityBadge(s)), " ")}. A finding stays unrated until a CVSS score or vendor rating is available.</p>`,
})}
${section({
  id: "practice",
  title: "Security in practice",
  body: html`<ul class="bullets">${c.security.practice.map((p) => html`<li>${inline(p)}</li>`)}</ul>${evidenceLinks([{ label: "Layout Intl", href: "/experience/#layout-intl" }, { label: "Hala AI", href: "/projects/hala-ai/" }])}`,
})}
${section({
  id: "study",
  title: "Study",
  body: html`<ul class="bullets">
    <li>Postgraduate Diploma in Cybersecurity, American University of Beirut, in progress: network and systems security, ethical hacking, threat analysis and defensive operations.</li>
    <li>ISC2 Certified in Cybersecurity, Fortinet Certified Associate and Fortinet Certified Fundamentals in Cybersecurity, and the Google Cybersecurity Professional Certificate. <a href="/certifications/#cybersecurity">Credentials</a></li>
    <li><a href="https://github.com/danielmadii/Kali-Linux-Android-noroot">A guide to running Kali Linux on Android without root</a>.</li>
  </ul>`,
})}
${section({
  id: "policy",
  title: "How findings are published",
  body: html`<p>A finding appears here only after it has been reported to the affected vendor. Reproduction details for unresolved issues are withheld, and nothing from client systems or private infrastructure is published.</p>`,
})}`;
  return { path: "/security/", title: "Security", description: "Security findings reported by Daniel Madi, with evidence levels, plus production security practice and cybersecurity study.", main };
};

export const findingDetail = (ctx, c, f) => {
  const levels = byId(c.security.evidence_levels);
  const d = f.disclosure || {};
  const main = html`
<article class="doc advisory">
  ${pageHeader({ title: f.title, intro: f.summary, crumb: { href: "/security/", label: "Security" } })}
  <div class="advisory-card">
    ${facts([
      { label: "Affected system", value: f.affected },
      { label: "Category", value: f.category },
      { label: "Severity", value: html`${severityBadge(f.severity)}${f.cvss ? html` <span class="mono-num">CVSS ${f.cvss}</span>` : ""}` },
      { label: "Evidence level", value: html`${evidenceBadge(levels[f.evidence])} <span class="quiet">${levels[f.evidence].description}</span>` },
      { label: "Discovered", value: f.discovered ? time(f.discovered) : null },
      { label: "Disclosure", value: d.public_url ? html`<a href="${d.public_url}">${d.status}</a>` : d.status },
      { label: "Report", value: d.report_id ? `${d.platform} report #${d.report_id}` : null },
    ])}
  </div>
  ${f.bodySource ? html`<div class="prose">${markdown(f.bodySource)}</div>` : ""}
  ${f.references && f.references.length ? html`<section class="block" id="references" aria-labelledby="references-title"><h2 class="block-title" id="references-title">References</h2><ul class="bullets">${f.references.map((r) => html`<li><a href="${r.href}">${r.label}</a></li>`)}</ul></section>` : ""}
  <p class="more"><a href="/security/">All security findings</a></p>
</article>`;
  return { path: `/security/${f.slug}/`, title: f.title, description: f.summary, main, ogType: "article" };
};

/* ---------- Writing ---------- */

const publicationHref = (p) => (p.bodySource ? `/writing/${p.slug}/` : p.url);

export const writingIndex = (ctx, c) => {
  const categories = [...new Set(c.publications.map((p) => p.category))].map((name) => ({ id: name.toLowerCase().replace(/\s+/g, "-"), name }));
  const filterable = c.publications.length >= 4;
  const main = html`
${pageHeader({
  title: "Writing",
  intro: "Tutorials, write-ups and technical articles. External items link to where they were published.",
})}
<div class="filterable" data-filter-root="writing">
  ${filterable ? filterBar({ scope: "writing", noun: "writing", categories }) : ""}
  <ol class="pubs" reversed>
    ${c.publications.map(
      (p) => html`<li class="pub" data-filter-item data-cats="${p.category.toLowerCase().replace(/\s+/g, "-")}" data-text="${searchText(p.title, p.summary, p.category, p.venue)}">
      <p class="pub-title"><a href="${publicationHref(p)}">${p.title}</a></p>
      <p class="pub-meta">${p.category}${p.venue ? html`, ${p.venue}` : ""}, ${time(p.date)}</p>
      <p class="pub-summary">${p.summary}</p>
      ${p.note ? html`<p class="quiet small">${p.note}</p>` : ""}
    </li>`
    )}
  </ol>
  ${filterable ? emptyState("writing", "items") : ""}
</div>`;
  return { path: "/writing/", title: "Writing", description: "Technical writing by Daniel Madi: tutorials, engineering write-ups and security analyses.", main };
};

export const publicationDetail = (ctx, c, p) => {
  const main = html`
<article class="doc">
  ${pageHeader({ title: p.title, intro: p.summary, crumb: { href: "/writing/", label: "Writing" } })}
  ${facts([{ label: "Published", value: time(p.date) }, { label: "Category", value: p.category }, { label: "Also at", value: p.url ? html`<a href="${p.url}">${p.venue || p.url}</a>` : null }])}
  <div class="prose">${markdown(p.bodySource)}</div>
</article>`;
  return { path: `/writing/${p.slug}/`, title: p.title, description: p.summary, main, ogType: "article" };
};

/* ---------- Certifications ---------- */

export const certifications = (ctx, c) => {
  const kinds = byId(c.certifications.kinds);
  const card = (cr) => html`
<li class="cred">
  ${cr.badge ? html`<img class="cred-badge" src="${cr.badge}" alt="" width="64" height="64" loading="lazy">` : ""}
  <h3 class="cred-name">${cr.verify_url ? html`<a href="${cr.verify_url}">${cr.name}</a>` : cr.name}</h3>
  <p class="cred-issuer">${cr.issuer || "Independent training"}</p>
  ${facts([
    { label: "Type", value: kinds[cr.kind].name },
    { label: "Status", value: cr.in_progress ? "In progress" : null },
    { label: "Issued", value: cr.issued ? time(cr.issued) : null },
    { label: "Expires", value: cr.expires ? time(cr.expires) : null },
    { label: "Credential ID", value: cr.credential_id },
    { label: "Verify", value: cr.verify_url ? html`<a href="${cr.verify_url}">Verification page</a>` : null },
  ])}
</li>`;
  const groups = c.certifications.categories
    .map((cat) => ({ ...cat, items: c.certifications.credentials.filter((cr) => cr.category === cat.id) }))
    .filter((g) => g.items.length);
  const main = html`
${pageHeader({
  title: "Certifications",
  intro: "Formal certifications are kept apart from course certificates and training, and each card says which it is.",
})}
<dl class="legend legend-inline">${c.certifications.kinds.map((k) => html`<div class="legend-item"><dt>${k.name}</dt><dd>${k.description}</dd></div>`)}</dl>
${groups.map((g) => section({ id: g.id, title: g.name, body: html`<ul class="creds">${g.items.map(card)}</ul>` }))}
${c.certifications.achievements.length
  ? section({ id: "achievements", title: "Achievements", body: html`<ul class="rows rows-compact">${c.certifications.achievements.map((a) => html`<li class="row"><div class="row-meta">${time(a.date)}</div><div class="row-body"><p>${a.href ? html`<a href="${a.href}">${a.name}</a>` : a.name}${a.detail ? html`. ${a.detail}` : ""}</p></div></li>`)}</ul>` })
  : ""}`;
  return { path: "/certifications/", title: "Certifications", description: "Daniel Madi's certifications, course certificates and training in cybersecurity, AI and infrastructure.", main };
};

/* ---------- Updates ---------- */

export const updates = (ctx, c) => {
  const used = new Set(c.updates.map((u) => u.category));
  const cats = c.updateCategories.filter((cat) => used.has(cat.id));
  const main = html`
${pageHeader({
  title: "Updates",
  intro: "Roles, projects, credentials and writing, newest first. Subscribe with the [RSS feed](/feed.xml).",
})}
<div class="filterable" data-filter-root="updates">
  ${filterBar({ scope: "updates", noun: "updates", categories: cats })}
  <ul class="rows rows-compact">${c.updates.map((u) => updateRow(u, c, { filterable: true }))}</ul>
  ${emptyState("updates", "updates")}
</div>`;
  return { path: "/updates/", title: "Updates", description: "A dated record of Daniel Madi's roles, projects, credentials and writing.", main };
};

/* ---------- CV ---------- */

export const cv = (ctx, c) => {
  const { site, experience: exp } = c;
  const kinds = byId(c.certifications.kinds);
  const main = html`
<article class="cv">
  <header class="cv-header">
    <h1>${site.name}</h1>
    <p class="cv-title">AI Engineer: AI agents, voice AI, integrations and infrastructure</p>
    <ul class="cv-contact">
      <li>${site.location}</li>
      <li><a href="mailto:${site.email}">${site.email}</a></li>
      <li><a href="https://github.com/danielmadii">github.com/danielmadii</a></li>
      <li><a href="https://www.linkedin.com/in/danielmadi/">linkedin.com/in/danielmadi</a></li>
      <li><a href="${site.url}/">${site.url.replace("https://", "")}</a></li>
    </ul>
    <div class="cv-actions">
      <a class="button" href="/assets/cv/Daniel-Madi-CV.pdf" download>Download PDF</a>
      <button class="button button-quiet" type="button" data-print hidden>Print</button>
    </div>
  </header>

  <section class="cv-section" aria-labelledby="cv-summary"><h2 id="cv-summary">Summary</h2>
    <p>Engineer building production AI systems: voice and messaging agents with LLM tool use, the integrations that connect them to business software, and the Linux and cloud infrastructure they run on. Co-founder and engineering lead of Hala AI at Meta Empires, and Technical Integration Engineer at Layout Intl. Five years of software and integration engineering, with postgraduate study in cybersecurity at the American University of Beirut.</p>
  </section>

  <section class="cv-section" aria-labelledby="cv-experience"><h2 id="cv-experience">Experience</h2>
    ${exp.work.map(
      (e) => html`<div class="cv-item">
      <div class="cv-item-head"><h3>${e.role}, ${e.organization}</h3><p class="cv-when">${formatRange(e.start, e.end)}${e.location ? html`, ${e.location}` : ""}</p></div>
      <ul class="bullets">${[...(e.responsibilities || []), ...(e.contributions || [])].map((b) => html`<li>${plain(b)}</li>`)}</ul>
    </div>`
    )}
  </section>

  <section class="cv-section" aria-labelledby="cv-projects"><h2 id="cv-projects">Selected projects</h2>
    ${c.projects.filter((p) => p.featured || p.slug === "staxai").map(
      (p) => html`<div class="cv-item"><div class="cv-item-head"><h3>${p.title}</h3><p class="cv-when">${p.type}${p.period ? html`, ${formatRange(p.period.start, p.period.end)}` : ""}</p></div><p>${p.summary}${p.links?.live ? html` <a href="${p.links.live}">${p.links.live.replace("https://", "")}</a>` : ""}</p></div>`
    )}
  </section>

  <section class="cv-section" aria-labelledby="cv-education"><h2 id="cv-education">Education</h2>
    ${exp.education.map(
      (e) => html`<div class="cv-item"><div class="cv-item-head"><h3>${e.credential}${e.status ? ` (${e.status.toLowerCase()})` : ""}</h3><p class="cv-when">${formatRange(e.start, e.end)}</p></div><p>${e.institution}${e.summary ? html`. ${e.summary}` : ""}</p></div>`
    )}
  </section>

  <section class="cv-section" aria-labelledby="cv-skills"><h2 id="cv-skills">Technical expertise</h2>
    <dl class="cv-skills">${c.skills.groups.map(
      (g) => html`<div><dt>${g.name}</dt><dd>${(g.items || g.subgroups.flatMap((s) => s.items)).join(", ")}</dd></div>`
    )}</dl>
  </section>

  <section class="cv-section" aria-labelledby="cv-certs"><h2 id="cv-certs">Certifications and training</h2>
    <ul class="bullets">${c.certifications.credentials.map(
      (cr) => html`<li>${cr.name}${cr.issuer ? html`, ${cr.issuer}` : ""} <span class="quiet">(${cr.in_progress ? "in progress" : [kinds[cr.kind].name.toLowerCase(), cr.issued && formatDate(cr.issued)].filter(Boolean).join(", ")})</span></li>`
    )}</ul>
  </section>

  <section class="cv-section" aria-labelledby="cv-languages"><h2 id="cv-languages">Languages</h2>
    <p>${exp.languages.map((l) => `${l.language} (${l.level.toLowerCase()})`).join(", ")}</p>
  </section>
</article>`;
  return { path: "/cv/", title: "CV", description: "Curriculum vitae of Daniel Madi, AI engineer: experience, projects, education, expertise and certifications.", main, bodyClass: "page-cv" };
};

/* ---------- 404 ---------- */

export const notFound = () => ({
  path: "/404.html",
  title: "Page not found",
  description: "This page does not exist.",
  main: html`
${pageHeader({ title: "Page not found", intro: "Nothing lives at this address. It may have moved when the site was reorganized." })}
<ul class="rows rows-compact">
  <li class="row"><div class="row-meta">Start</div><div class="row-body"><p><a href="/">Overview</a></p></div></li>
  <li class="row"><div class="row-meta">Work</div><div class="row-body"><p><a href="/projects/">Projects</a> and <a href="/experience/">experience</a></p></div></li>
  <li class="row"><div class="row-meta">Research</div><div class="row-body"><p><a href="/security/">Security findings</a></p></div></li>
</ul>`,
});

/* ---------- Feeds ---------- */

export const rss = (ctx, c) => {
  const abs = (href) => (isExternal(href) ? href : c.site.url + href);
  const items = c.updates
    .map((u) => {
      const link = u.ref ? abs(u.ref.href) : `${c.site.url}/updates/`;
      const guid = `${c.site.url}/updates/#${sortKey(u.date)}-${plain(u.text).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
      return `    <item>
      <title>${esc(plain(u.text))}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="false">${esc(guid)}</guid>
      <pubDate>${rfc822(u.date)}</pubDate>
      <category>${esc(byId(c.updateCategories)[u.category].name)}</category>
    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Daniel Madi: updates</title>
    <link>${c.site.url}/updates/</link>
    <atom:link href="${c.site.url}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Roles, projects, credentials and writing from Daniel Madi.</description>
    <language>en</language>
    <lastBuildDate>${ctx.buildDate.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
};

export const sitemap = (ctx, c, paths) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .filter((p) => p !== "/404.html")
  .map((p) => `  <url><loc>${c.site.url}${p}</loc></url>`)
  .join("\n")}
</urlset>
`;

export const robots = (c) => `User-agent: *
Allow: /

Sitemap: ${c.site.url}/sitemap.xml
`;
