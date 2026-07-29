// Minimalny serwer statyczny dla OK Agency (bez zależności).
// Przekazuje argumenty host/port z CLI i zmiennych środowiskowych:
//   npm run dev -- --port 7100 --host 127.0.0.1
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

const argValue = (name, fallback) => {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  const inline = process.argv.find(a => a.startsWith(`--${name}=`));
  return inline ? inline.split("=")[1] : fallback;
};

const port = Number(argValue("port", process.env.PORT || 7100));
const host = argValue("host", process.env.HOST || "127.0.0.1");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
    if (!path || path.endsWith("/") || path === ".") path = join(path, "index.html");
    let file = join(root, path);
    if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
    let info = await stat(file).catch(() => null);
    if (!info && !extname(file)) {
      const htmlFile = `${file}.html`;
      const htmlInfo = await stat(htmlFile).catch(() => null);
      if (htmlInfo?.isFile()) {
        file = htmlFile;
        info = htmlInfo;
      }
    }
    const target = info && info.isDirectory() ? join(file, "index.html") : file;
    const body = await readFile(target);
    res.writeHead(200, {
      "Content-Type": types[extname(target).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    res.end(body);
  } catch {
    const body = await readFile(join(root, "404.html")).catch(() => Buffer.from("404", "utf8"));
    res.writeHead(404, {
      "Content-Type": body.length > 3 ? types[".html"] : "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    });
    res.end(body);
  }
}).listen(port, host, () => {
  console.log(`OK Agency dev server: http://${host}:${port}/`);
});
