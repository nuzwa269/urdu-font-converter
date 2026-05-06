import { createFileRoute } from "@tanstack/react-router";

const INJECT_SCRIPT = (origin: string) => `
<link rel="stylesheet" href="https://fonts.cdnfonts.com/css/jameel-noori-nastaleeq">
<script src="${origin}/nastaleeq.js?v=${Date.now()}"></script>
`;

function absolutize(url: string, base: string) {
  try { return new URL(url, base).toString(); } catch { return url; }
}

function rewriteHtml(html: string, targetUrl: string, proxyOrigin: string) {
  const proxyPrefix = `${proxyOrigin}/api/proxy?url=`;

  // Inject <base> so relative URLs resolve correctly inside iframe
  const baseTag = `<base href="${targetUrl}">`;
  const inject = baseTag + INJECT_SCRIPT(proxyOrigin);

  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>${inject}`);
  } else {
    html = inject + html;
  }

  // Rewrite navigations: href on <a> tags
  html = html.replace(/<a\s+([^>]*?)href=["']([^"']+)["']/gi, (m, attrs, href) => {
    if (/^(javascript:|mailto:|tel:|#)/i.test(href)) return m;
    const abs = absolutize(href, targetUrl);
    return `<a ${attrs}href="${proxyPrefix}${encodeURIComponent(abs)}"`;
  });

  // Rewrite forms
  html = html.replace(/<form\s+([^>]*?)action=["']([^"']+)["']/gi, (m, attrs, action) => {
    const abs = absolutize(action, targetUrl);
    return `<form ${attrs}action="${proxyPrefix}${encodeURIComponent(abs)}"`;
  });

  // Strip frame-blocking meta and CSP
  html = html.replace(/<meta[^>]+http-equiv=["']content-security-policy["'][^>]*>/gi, "");

  return html;
}

export const Route = createFileRoute("/api/proxy")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const target = u.searchParams.get("url");
        if (!target) return new Response("Missing url", { status: 400 });

        let targetUrl: string;
        try {
          targetUrl = new URL(target).toString();
        } catch {
          return new Response("Invalid url", { status: 400 });
        }

        try {
          const upstream = await fetch(targetUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "ur,en;q=0.9",
            },
            redirect: "follow",
          });

          const ct = upstream.headers.get("content-type") || "";
          const proxyOrigin = u.origin;

          if (ct.includes("text/html")) {
            const html = await upstream.text();
            const finalUrl = upstream.url || targetUrl;
            const rewritten = rewriteHtml(html, finalUrl, proxyOrigin);
            return new Response(rewritten, {
              status: upstream.status,
              headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "no-store",
                // Allow framing
                "X-Frame-Options": "ALLOWALL",
              },
            });
          }

          // Pass-through for non-HTML
          const buf = await upstream.arrayBuffer();
          return new Response(buf, {
            status: upstream.status,
            headers: {
              "Content-Type": ct || "application/octet-stream",
              "Cache-Control": "public, max-age=3600",
            },
          });
        } catch (e: any) {
          return new Response(`Proxy error: ${e?.message || e}`, { status: 502 });
        }
      },
    },
  },
});
