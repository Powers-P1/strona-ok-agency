import assert from "node:assert/strict";
import test from "node:test";

import {
  addScriptNonce,
  createCspNonce,
  onRequest,
} from "./_middleware.js";

const CSP = "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; object-src 'none'";

function createContext(url, response) {
  return {
    request: new Request(url),
    next: async () => response,
  };
}

test("adds one nonce without weakening script-src", () => {
  const result = addScriptNonce(CSP, "abc123");

  assert.equal(
    result,
    "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com 'nonce-abc123'; object-src 'none'",
  );
  assert.doesNotMatch(result, /unsafe-inline/i);
});

test("generates a fresh 128-bit base64 nonce", () => {
  const first = createCspNonce();
  const second = createCspNonce();

  assert.match(first, /^[A-Za-z0-9+/]{22}==$/);
  assert.match(second, /^[A-Za-z0-9+/]{22}==$/);
  assert.notEqual(first, second);
});

test("adds a fresh nonce to each HTML response", async () => {
  const first = await onRequest(
    createContext(
      "https://okagency.pl/",
      new Response("<!doctype html>", {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Security-Policy": CSP,
        },
      }),
    ),
  );
  const second = await onRequest(
    createContext(
      "https://okagency.pl/kontakt",
      new Response("<!doctype html>", {
        headers: {
          "Content-Type": "text/html",
          "Content-Security-Policy": CSP,
        },
      }),
    ),
  );

  const firstCsp = first.headers.get("Content-Security-Policy");
  const secondCsp = second.headers.get("Content-Security-Policy");
  const firstNonce = firstCsp.match(/'nonce-([^']+)'/)[1];
  const secondNonce = secondCsp.match(/'nonce-([^']+)'/)[1];

  assert.notEqual(firstNonce, secondNonce);
  assert.doesNotMatch(firstCsp, /unsafe-inline/i);
  assert.equal(await first.text(), "<!doctype html>");
});

test("does not add a nonce to non-HTML responses", async () => {
  const original = new Response("User-agent: *", {
    headers: {
      "Content-Type": "text/plain",
      "Content-Security-Policy": CSP,
    },
  });
  const result = await onRequest(
    createContext("https://okagency.pl/robots.txt", original),
  );

  assert.equal(result, original);
  assert.doesNotMatch(
    result.headers.get("Content-Security-Policy"),
    /'nonce-/,
  );
});

test("keeps the pages.dev canonical redirect", async () => {
  const result = await onRequest({
    request: new Request(
      "https://ok-agency.pages.dev/kontakt?source=preview",
    ),
    next: async () => {
      throw new Error("redirect must not call next()");
    },
  });

  assert.equal(result.status, 301);
  assert.equal(
    result.headers.get("Location"),
    "https://okagency.pl/kontakt?source=preview",
  );
});
