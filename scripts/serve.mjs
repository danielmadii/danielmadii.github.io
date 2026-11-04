import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
};

export const serve = (port = Number(process.env.PORT) || 4000) =>
  new Promise((resolveServer) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, "http://localhost");
      let file = normalize(join(ROOT, decodeURIComponent(url.pathname)));
      if (!file.startsWith(ROOT)) {
        res.writeHead(403).end();
        return;
      }
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
      let status = 200;
      if (!existsSync(file)) {
        file = join(ROOT, "404.html");
        status = 404;
      }
      res.writeHead(status, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
      createReadStream(file).pipe(res);
    });
    server.listen(port, "127.0.0.1", () => resolveServer(server));
  });

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await serve();
  console.log(`Serving the site at http://127.0.0.1:${server.address().port}/`);
}
