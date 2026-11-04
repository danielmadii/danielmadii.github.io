import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { validateDate, sortKey } from "./dates.mjs";

const readJson = (dir, name) => {
  const file = join(dir, name);
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`Could not read ${file}: ${error.message}`);
  }
};

export const loadContent = (root) => {
  const dir = join(root, "content");
  const errors = [];
  const fail = (where, message) => errors.push(`${where}: ${message}`);
  const need = (where, obj, keys) => keys.forEach((k) => (obj[k] === undefined || obj[k] === null || obj[k] === "") && fail(where, `"${k}" is required`));
  const date = (where, value) => {
    if (value === null || value === undefined) return;
    try {
      validateDate(value);
    } catch (e) {
      fail(where, e.message);
    }
  };
  const body = (where, rel) => {
    if (!rel) return null;
    const file = join(dir, rel);
    if (!existsSync(file)) {
      fail(where, `body file content/${rel} does not exist`);
      return null;
    }
    return readFileSync(file, "utf8");
  };
  const unique = (where, list, key) => {
    const seen = new Set();
    list.forEach((item) => {
      if (seen.has(item[key])) fail(where, `duplicate ${key} "${item[key]}"`);
      seen.add(item[key]);
    });
  };

  const site = readJson(dir, "site.json");
  need("site.json", site, ["name", "url", "description", "intro"]);

  const experience = readJson(dir, "experience.json");
  for (const group of ["work", "other", "volunteering"]) {
    (experience[group] ?? []).forEach((e, i) => {
      const where = `experience.json ${group}[${i}]`;
      need(where, e, ["id", "organization", "role", "start"]);
      date(where, e.start);
      date(where, e.end);
    });
  }
  (experience.education ?? []).forEach((e, i) => {
    const where = `experience.json education[${i}]`;
    need(where, e, ["id", "institution", "credential", "start"]);
    date(where, e.start);
    date(where, e.end);
  });

  const projectsFile = readJson(dir, "projects.json");
  const projectCategories = new Set(projectsFile.categories.map((c) => c.id));
  unique("projects.json", projectsFile.projects, "slug");
  const projects = projectsFile.projects.map((p, i) => {
    const where = `projects.json projects[${i}] (${p.slug ?? "no slug"})`;
    need(where, p, ["slug", "title", "summary", "type", "categories"]);
    (p.categories ?? []).forEach((c) => projectCategories.has(c) || fail(where, `unknown category "${c}"`));
    if (p.period) {
      date(where, p.period.start);
      date(where, p.period.end);
    }
    return { ...p, bodySource: body(where, p.body) };
  });
  projects.sort((a, b) => {
    const ka = a.period ? sortKey(a.period.end ?? "9999") + sortKey(a.period.start) : "0";
    const kb = b.period ? sortKey(b.period.end ?? "9999") + sortKey(b.period.start) : "0";
    return kb.localeCompare(ka);
  });

  const security = readJson(dir, "security.json");
  const evidenceIds = new Set(security.evidence_levels.map((l) => l.id));
  const severities = new Set(security.severities);
  unique("security.json", security.findings, "slug");
  const findings = security.findings.map((f, i) => {
    const where = `security.json findings[${i}] (${f.slug ?? "no slug"})`;
    need(where, f, ["slug", "title", "summary", "severity", "evidence"]);
    if (!severities.has(f.severity)) fail(where, `severity must be one of ${[...severities].join(", ")}`);
    if (!evidenceIds.has(f.evidence)) fail(where, `evidence must be one of ${[...evidenceIds].join(", ")}`);
    date(where, f.discovered);
    return { ...f, bodySource: body(where, f.body) };
  });

  const publicationsFile = readJson(dir, "publications.json");
  unique("publications.json", publicationsFile.publications, "slug");
  const publications = publicationsFile.publications.map((p, i) => {
    const where = `publications.json publications[${i}] (${p.slug ?? "no slug"})`;
    need(where, p, ["slug", "title", "date", "category", "summary"]);
    if (!p.url && !p.body) fail(where, `needs a "url" or a "body"`);
    date(where, p.date);
    return { ...p, bodySource: body(where, p.body) };
  });
  publications.sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date)));

  const certs = readJson(dir, "certifications.json");
  const certCategories = new Set(certs.categories.map((c) => c.id));
  const kinds = new Set(certs.kinds.map((k) => k.id));
  certs.credentials.forEach((c, i) => {
    const where = `certifications.json credentials[${i}] (${c.name ?? "no name"})`;
    need(where, c, ["name", "category", "kind"]);
    if (!certCategories.has(c.category)) fail(where, `unknown category "${c.category}"`);
    if (!kinds.has(c.kind)) fail(where, `unknown kind "${c.kind}"`);
    date(where, c.issued);
    date(where, c.expires);
  });

  const skills = readJson(dir, "skills.json");
  unique("skills.json", skills.groups, "id");

  const updatesFile = readJson(dir, "updates.json");
  const updateCategories = new Set(updatesFile.categories.map((c) => c.id));
  updatesFile.updates.forEach((u, i) => {
    const where = `updates.json updates[${i}]`;
    need(where, u, ["date", "category", "text"]);
    if (!updateCategories.has(u.category)) fail(where, `unknown category "${u.category}"`);
    date(where, u.date);
  });
  const updates = [...updatesFile.updates].sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date)));

  if (errors.length) {
    throw new Error(`Content has ${errors.length} problem${errors.length > 1 ? "s" : ""}:\n  - ${errors.join("\n  - ")}`);
  }

  return {
    site,
    experience,
    projects,
    projectCategories: projectsFile.categories,
    security: { ...security, findings },
    publications,
    certifications: certs,
    skills,
    updates,
    updateCategories: updatesFile.categories,
  };
};
