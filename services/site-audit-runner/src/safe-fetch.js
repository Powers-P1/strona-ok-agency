import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { isIpv4, isIpv6, isPublicIp } from "../../../worker/site-audit-core.js";

export class ScanError extends Error {
  constructor(code, message, retryable = false) {
    super(message);
    this.name = "ScanError";
    this.code = code;
    this.retryable = retryable;
  }
}

const BLOCKED_SUFFIXES = [".internal", ".invalid", ".lan", ".local", ".localhost", ".onion", ".test"];

export function validateTargetUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new ScanError("invalid_target", "Nieprawidłowy adres audytu.");
  }
  if (!new Set(["http:", "https:"]).has(url.protocol) || url.username || url.password) {
    throw new ScanError("invalid_target", "Dozwolone są wyłącznie publiczne adresy HTTP i HTTPS.");
  }
  if ((url.protocol === "http:" && url.port && url.port !== "80") ||
      (url.protocol === "https:" && url.port && url.port !== "443")) {
    throw new ScanError("invalid_target", "Dozwolone są wyłącznie porty 80 i 443.");
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase().replace(/\.$/, "");
  if (!hostname || hostname === "localhost" || isIpv4(hostname) || isIpv6(hostname) || BLOCKED_SUFFIXES.some(suffix => hostname.endsWith(suffix))) {
    throw new ScanError("private_target", "Cel audytu nie jest publiczną domeną.");
  }
  url.hostname = hostname;
  url.hash = "";
  return url;
}

export async function resolveAndVet(hostname, resolver = dns) {
  const settled = await Promise.allSettled([
    resolver.resolve4(hostname),
    resolver.resolve6(hostname),
  ]);
  const addresses = settled.flatMap(result => result.status === "fulfilled" ? result.value : []);
  if (addresses.length === 0) throw new ScanError("dns_not_found", "Domena nie wskazuje na publiczny serwer.", true);
  if (addresses.some(address => !isPublicIp(address))) {
    throw new ScanError("private_target", "Domena wskazuje na niedozwolony adres sieciowy.");
  }
  return [...new Set(addresses)];
}

function requestPinned(url, address, options) {
  const client = url.protocol === "https:" ? https : http;
  const family = isIpv4(address) ? 4 : 6;
  return new Promise((resolve, reject) => {
    const request = client.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || undefined,
      path: `${url.pathname}${url.search}`,
      method: "GET",
      servername: url.hostname,
      rejectUnauthorized: true,
      lookup: (_hostname, lookupOptions, callback) => {
        if (lookupOptions?.all) callback(null, [{ address, family }]);
        else callback(null, address, family);
      },
      headers: {
        accept: options.accept,
        "accept-encoding": "identity",
        "user-agent": "OKAgencyPassiveAudit/1.0 (+https://okagency.pl/diagnoza-www)",
        host: url.host,
      },
    }, response => {
      const chunks = [];
      let size = 0;
      response.on("data", chunk => {
        size += chunk.length;
        if (size > options.maxBytes) {
          request.destroy(new ScanError("response_too_large", "Odpowiedź serwera przekracza bezpieczny limit."));
          return;
        }
        chunks.push(chunk);
      });
      response.on("end", () => {
        const certificate = response.socket?.getPeerCertificate?.();
        resolve({
          status: response.statusCode || 0,
          headers: response.headers,
          body: Buffer.concat(chunks).toString("utf8"),
          remoteAddress: address,
          tls: url.protocol === "https:" ? {
            protocol: response.socket?.getProtocol?.() || null,
            validTo: certificate?.valid_to || null,
            issuer: certificate?.issuer?.O || certificate?.issuer?.CN || null,
          } : null,
        });
      });
    });
    request.setTimeout(options.timeoutMs, () => request.destroy(new ScanError("fetch_timeout", "Serwer nie odpowiedział w wymaganym czasie.", true)));
    request.on("error", error => reject(error instanceof ScanError ? error : new ScanError("fetch_failed", "Nie udało się pobrać strony.", true)));
    request.end();
  });
}

export async function safeFetch(input, {
  maxRedirects = 5,
  maxBytes = 1_048_576,
  timeoutMs = 12_000,
  accept = "text/html,application/xhtml+xml;q=0.9,text/plain;q=0.5",
  resolver = dns,
} = {}) {
  let url = validateTargetUrl(input);
  const redirects = [];
  const startedAt = Date.now();
  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const addresses = await resolveAndVet(url.hostname, resolver);
    const response = await requestPinned(url, addresses[0], { maxBytes, timeoutMs, accept });
    const location = response.headers.location;
    if ([301, 302, 303, 307, 308].includes(response.status) && location) {
      if (hop === maxRedirects) throw new ScanError("too_many_redirects", "Strona ma zbyt wiele przekierowań.");
      const next = validateTargetUrl(new URL(location, url).href);
      redirects.push({ from: url.href, to: next.href, status: response.status });
      url = next;
      continue;
    }
    return {
      ...response,
      url: url.href,
      redirects,
      durationMs: Date.now() - startedAt,
    };
  }
  throw new ScanError("too_many_redirects", "Strona ma zbyt wiele przekierowań.");
}
