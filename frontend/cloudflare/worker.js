const FILE_EXTENSION_REGEX = /\.[a-zA-Z0-9]+$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return proxyApiRequest(request, env);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    const acceptsHtml = request.headers.get("Accept")?.includes("text/html");
    const isDocumentRequest =
      request.method === "GET" &&
      acceptsHtml &&
      !FILE_EXTENSION_REGEX.test(url.pathname);

    if (!isDocumentRequest) {
      return assetResponse;
    }

    const indexRequest = new Request(new URL("/index.html", url), request);
    return env.ASSETS.fetch(indexRequest);
  },
};

function proxyApiRequest(request, env) {
  if (env.EDGE_API) {
    return env.EDGE_API.fetch(request);
  }

  const incomingUrl = new URL(request.url);
  const apiOrigin = env.API_ORIGIN || "https://tarkeeb-pro-edge-api.bobkumeel.workers.dev";
  const upstreamUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, apiOrigin);

  return fetch(new Request(upstreamUrl.toString(), request));
}
