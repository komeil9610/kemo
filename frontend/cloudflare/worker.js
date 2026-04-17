/**
 * Developed by [Kumeel Taher Al Nahab / كميل طاهر ال نهاب]
 * For TrkeebPro
 * Build date: 2026-04-10
 */
const FILE_EXTENSION_REGEX = /\.[a-zA-Z0-9]+$/;
const INTERNAL_PROXY_HEADER = "X-Tarkeeb-Pro-Internal";
const INTERNAL_PROXY_SECRET_HEADER = "X-Tarkeeb-Pro-Proxy-Secret";
const EXCEL_UPLOAD_PATHS = new Set([
  "/api/operations/excel-import/preview-upload",
  "/api/operations/excel-import/upload",
]);

const worker = {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (url.pathname.startsWith("/api/")) {
        return withSecurityHeaders(await proxyApiRequest(request, env), request);
      }

      if (shouldRecoverSpaNavigation(request, url)) {
        return withSecurityHeaders(
          Response.redirect(new URL(url.pathname || "/", url.origin).toString(), 303),
          request
        );
      }

      const assetResponse = await fetchAsset(request, env);
      if (assetResponse.status !== 404) {
        return withSecurityHeaders(assetResponse, request);
      }

      const acceptsHtml = request.headers.get("Accept")?.includes("text/html");
      const isDocumentRequest =
        request.method === "GET" &&
        acceptsHtml &&
        !FILE_EXTENSION_REGEX.test(url.pathname);

      if (!isDocumentRequest) {
        return withSecurityHeaders(assetResponse, request);
      }

      const indexRequest = new Request(new URL("/index.html", url), request);
      return withSecurityHeaders(await fetchAsset(indexRequest, env), request);
    } catch (error) {
      console.error("Frontend worker request failed", {
        method: request.method,
        url: request.url,
        error: error?.message || String(error),
      });
      return withSecurityHeaders(workerErrorResponse(error), request);
    }
  },
};

export default worker;

async function proxyApiRequest(request, env) {
  const incomingUrl = new URL(request.url);
  const excelUploadOrigin = String(env.EXCEL_UPLOAD_ORIGIN || "").trim();
  const apiOrigin = env.API_ORIGIN || "https://api.kumeelalnahab.com";
  const upstreamUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, apiOrigin);

  if (excelUploadOrigin && EXCEL_UPLOAD_PATHS.has(incomingUrl.pathname)) {
    try {
      const excelUploadUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, excelUploadOrigin);
      return await fetch(createOriginProxyRequest(request, excelUploadUrl.toString(), env, true));
    } catch (error) {
      console.error("Excel upload proxy failed", {
        url: request.url,
        uploadOrigin: excelUploadOrigin,
        error: error?.message || String(error),
      });
      return textResponse("Excel upload service is temporarily unavailable.", 502);
    }
  }

  if (env.EDGE_API) {
    try {
      return await env.EDGE_API.fetch(createServiceBindingRequest(request, env));
    } catch (error) {
      console.error("Service binding proxy failed", {
        url: request.url,
        error: error?.message || String(error),
      });
    }
  }

  if (!canFallbackToOrigin(request.method)) {
    return textResponse("API service binding is temporarily unavailable.", 502);
  }

  try {
    return await fetch(createOriginFallbackRequest(request, upstreamUrl.toString(), env));
  } catch (error) {
    console.error("Origin proxy failed", {
      url: upstreamUrl.toString(),
      error: error?.message || String(error),
    });
    return textResponse("API upstream is temporarily unavailable.", 502);
  }
}

function createServiceBindingRequest(request, env) {
  return createProxiedRequest(request, request.url, env, canRequestHaveBody(request.method) ? request.clone().body : undefined);
}

function createOriginFallbackRequest(request, url, env) {
  return createOriginProxyRequest(request, url, env, false);
}

function createOriginProxyRequest(request, url, env, includeBody) {
  return createProxiedRequest(request, url, env, includeBody && canRequestHaveBody(request.method) ? request.clone().body : undefined);
}

function createProxiedRequest(request, url, env, requestBody) {
  const headers = buildUpstreamHeaders(request, env);
  const internalProxySecret = String(env.INTERNAL_PROXY_SECRET || "").trim();
  if (internalProxySecret) {
    headers.set(INTERNAL_PROXY_SECRET_HEADER, internalProxySecret);
  }

  return new Request(url, {
    method: request.method,
    headers,
    body: canRequestHaveBody(request.method) ? requestBody : undefined,
    redirect: "manual",
  });
}

function buildUpstreamHeaders(request, env) {
  const headers = new Headers();
  const headerNamesToForward = [
    "Accept",
    "Accept-Language",
    "Authorization",
    "Content-Type",
    "Origin",
    "Referer",
    "User-Agent",
    "X-Workspace-Role",
  ];

  for (const name of headerNamesToForward) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  headers.set(INTERNAL_PROXY_HEADER, "1");

  const forwardedFor = request.headers.get("CF-Connecting-IP");
  if (forwardedFor) {
    headers.set("X-Forwarded-For", forwardedFor);
  }

  const forwardedProto = request.headers.get("X-Forwarded-Proto");
  if (forwardedProto) {
    headers.set("X-Forwarded-Proto", forwardedProto);
  }

  const originalHost = request.headers.get("Host");
  if (originalHost) {
    headers.set("X-Forwarded-Host", originalHost);
  }

  const rayId = request.headers.get("CF-Ray");
  if (rayId) {
    headers.set("X-Cloudflare-Ray", rayId);
  }

  return headers;
}

function canRequestHaveBody(method) {
  return !["GET", "HEAD"].includes(String(method || "").toUpperCase());
}

function canFallbackToOrigin(method) {
  return ["GET", "HEAD", "OPTIONS"].includes(String(method || "").toUpperCase());
}

function shouldRecoverSpaNavigation(request, url) {
  const method = String(request.method || "").toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return false;
  }

  return !FILE_EXTENSION_REGEX.test(url.pathname || "");
}

async function fetchAsset(request, env) {
  if (!env.ASSETS?.fetch) {
    return textResponse("Static assets binding is not available.", 503);
  }

  try {
    return await env.ASSETS.fetch(request);
  } catch (error) {
    console.error("Asset fetch failed", {
      url: request.url,
      error: error?.message || String(error),
    });
    return textResponse("Static assets are temporarily unavailable.", 503);
  }
}

function withSecurityHeaders(response, request) {
  const headers = new Headers(response.headers);
  const url = new URL(request.url);
  const pathname = url.pathname;
  const isHtml =
    headers.get("content-type")?.includes("text/html") ||
    (request.method === "GET" &&
      request.headers.get("Accept")?.includes("text/html") &&
      !FILE_EXTENSION_REGEX.test(url.pathname));
  const isApiRequest = pathname.startsWith("/api/");
  const isServiceWorker = pathname === "/service-worker.js";
  const isStaticAsset = pathname.startsWith("/static/") || FILE_EXTENSION_REGEX.test(pathname);
  const isFingerprintedAsset = /\/static\/.+\.[0-9a-f]{8,}\./i.test(pathname);

  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=(), payment=(), usb=()");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  if (isHtml) {
    headers.set("Content-Type", headers.get("Content-Type") || "text/html; charset=utf-8");
  }

  if (isHtml || isApiRequest) {
    headers.set("Vary", appendVary(headers.get("Vary"), "Cookie"));
  }

  if (isHtml || isApiRequest || isServiceWorker) {
    headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
  } else if (isFingerprintedAsset) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.delete("Pragma");
    headers.delete("Expires");
  } else if (isStaticAsset) {
    headers.set("Cache-Control", "public, max-age=3600");
    headers.delete("Pragma");
    headers.delete("Expires");
  }

  if (isHtml && pathname === "/login") {
    headers.set("Clear-Site-Data", "\"cache\", \"storage\"");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function appendVary(currentValue, nextValue) {
  const existing = String(currentValue || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (existing.includes(nextValue)) {
    return existing.join(", ");
  }

  return [...existing, nextValue].join(", ");
}

function workerErrorResponse(error) {
  return textResponse(error?.message || "Unhandled worker error.", 500);
}

function textResponse(message, status) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "private, no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
