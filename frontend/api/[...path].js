const API_ORIGIN = process.env.API_ORIGIN || "https://api.kumeelalnahab.com";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const readRequestBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(chunks.length ? Buffer.concat(chunks) : undefined));
    req.on("error", reject);
  });

const copyResponseHeaders = (upstream, res) => {
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  });
};

export default async function handler(req, res) {
  const rawPath = Array.isArray(req.query.path) ? req.query.path.join("/") : req.query.path || "";
  const targetUrl = new URL(`/api/${rawPath}`, API_ORIGIN);

  for (const [key, value] of Object.entries(req.query || {})) {
    if (key !== "path") {
      const values = Array.isArray(value) ? value : [value];
      values.forEach((item) => targetUrl.searchParams.append(key, item));
    }
  }

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  headers.set("x-forwarded-host", req.headers.host || "");

  const hasBody = !["GET", "HEAD"].includes(String(req.method || "GET").toUpperCase());
  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: hasBody ? await readRequestBody(req) : undefined,
    redirect: "manual",
  });

  copyResponseHeaders(upstream, res);
  res.status(upstream.status).send(Buffer.from(await upstream.arrayBuffer()));
}
