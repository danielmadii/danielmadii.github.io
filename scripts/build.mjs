import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContent } from "./lib/content.mjs";
import { page } from "./lib/layout.mjs";
import * as pages from "./pages.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(ROOT, ".generated.json");

const hashAsset = (rel) => {
  const digest = createHash("sha256").update(readFileSync(join(ROOT, rel))).digest("hex").slice(0, 10);
  return `/${rel}?v=${digest}`;
};

const outputFile = (path) => {
  if (path.endsWith("/")) return join(path, "index.html").slice(1);
  return path.slice(1);
};

export const build = ({ quiet = false } = {}) => {
  const started = Date.now();
  const content = loadContent(ROOT);
  const buildDate = process.env.BUILD_DATE ? new Date(process.env.BUILD_DATE) : new Date();
  const ctx = {
    site: content.site,
    buildDate,
    assets: { css: hashAsset("assets/css/site.css"), js: hashAsset("assets/js/site.js") },
  };

  const views = [
    pages.overview(ctx, content),
    pages.experience(ctx, content),
    pages.projectsIndex(ctx, content),
    ...content.projects.map((p) => pages.projectDetail(ctx, content, p)),
    pages.expertise(ctx, content),
    pages.securityIndex(ctx, content),
    ...content.security.findings.map((f) => pages.findingDetail(ctx, content, f)),
    pages.writingIndex(ctx, content),
    ...content.publications.filter((p) => p.bodySource).map((p) => pages.publicationDetail(ctx, content, p)),
    pages.certifications(ctx, content),
    pages.updates(ctx, content),
    pages.cv(ctx, content),
    pages.notFound(ctx, content),
  ];

  const files = new Map();
  for (const view of views) {
    if (files.has(outputFile(view.path))) throw new Error(`Two pages share the path ${view.path}`);
    files.set(outputFile(view.path), page(ctx, view));
  }
  const paths = views.map((v) => v.path);
  files.set("feed.xml", pages.rss(ctx, content));
  files.set("sitemap.xml", pages.sitemap(ctx, content, paths));
  files.set("robots.txt", pages.robots(content));

  const previous = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : [];
  for (const rel of previous) {
    if (files.has(rel)) continue;
    const abs = join(ROOT, rel);
    if (existsSync(abs)) rmSync(abs);
    let dir = dirname(abs);
    while (dir !== ROOT && existsSync(dir) && readdirSync(dir).length === 0) {
      rmdirSync(dir);
      dir = dirname(dir);
    }
  }
  for (const [rel, body] of files) {
    const abs = join(ROOT, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, body);
  }
  writeFileSync(MANIFEST, JSON.stringify([...files.keys()].sort(), null, 2) + "\n");

  if (!quiet) console.log(`Built ${files.size} files in ${Date.now() - started} ms.`);
  return { files: [...files.keys()], paths };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    build();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
