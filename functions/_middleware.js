const CANONICAL_HOST = "okagency.pl";
const PRODUCTION_PAGES_HOST = "ok-agency.pages.dev";
const CSP_HEADER = "Content-Security-Policy";

export function createCspNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

export function addScriptNonce(csp, nonce) {
  if (!csp || !nonce) {
    return csp;
  }

  return csp.replace(
    /(^|;\s*)(script-src\s+)([^;]+)/i,
    (_match, prefix, directive, sources) =>
      `${prefix}${directive}${sources.trim()} 'nonce-${nonce}'`,
  );
}

function isHtmlResponse(response) {
  const contentType = response.headers.get("Content-Type") || "";
  return contentType.toLowerCase().includes("text/html");
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === PRODUCTION_PAGES_HOST) {
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return Response.redirect(url, 301);
  }

  const response = await context.next();
  if (!isHtmlResponse(response)) {
    return response;
  }

  const csp = response.headers.get(CSP_HEADER);
  const nonce = createCspNonce();
  const cspWithNonce = addScriptNonce(csp, nonce);

  if (cspWithNonce === csp) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set(CSP_HEADER, cspWithNonce);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
