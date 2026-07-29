const CANONICAL_HOST = "okagency.pl";
const PRODUCTION_PAGES_HOST = "ok-agency.pages.dev";

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === PRODUCTION_PAGES_HOST) {
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return Response.redirect(url, 301);
  }

  return context.next();
}
