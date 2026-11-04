import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "./build.mjs";
import { serve } from "./serve.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets/cv/Daniel-Madi-CV.pdf");

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const chrome = CANDIDATES.find((p) => existsSync(p));
if (!chrome) {
  console.error("Chrome was not found. Set CHROME_PATH to your Chrome or Chromium binary, or print /cv/ to PDF from the browser.");
  process.exit(1);
}

build({ quiet: true });
const server = await serve(0);
const url = `http://127.0.0.1:${server.address().port}/cv/`;
try {
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-pdf-header-footer",
    "--run-all-compositor-stages-before-draw",
    `--print-to-pdf=${OUT}`,
    url,
  ];
  if (typeof process.getuid === "function" && process.getuid() === 0) args.unshift("--no-sandbox");
  await promisify(execFile)(chrome, args, { timeout: 60000 });
  console.log(`Wrote ${OUT.replace(ROOT + "/", "")} from ${url}`);
} finally {
  server.close();
}
