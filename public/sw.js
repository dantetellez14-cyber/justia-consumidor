/**
 * JustIA Consumidor — Service Worker
 *
 * Strategy:
 * - Static shell (/, /mis-casos, /notificaciones, /empresa): Cache First
 * - API routes: Network First with 4s timeout → cache fallback
 * - Offline fallback: /offline page
 *
 * Cache versions → bump CACHE_VERSION to force refresh on deploy.
 */

const CACHE_VERSION = "justia-v3";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

const PRECACHE_URLS = [
  "/",
  "/mis-casos",
  "/notificaciones",
  "/empresa",
  "/empresas",
  "/offline",
  "/manifest.json",
];

const API_CACHE_URLS = [
  "/api/cases",
  "/api/notifications",
];

// ── Install: precache shell ───────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {
        // Non-fatal: some pages may need auth
      })
    ).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: strategy per request type ─────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Skip Clerk auth routes and Next.js internals
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/sign-in") ||
    url.pathname.startsWith("/sign-up") ||
    url.pathname.includes("/__nextjs") ||
    url.pathname.includes("/api/auth")
  ) {
    return;
  }

  // API routes: Network First with 4s timeout
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // Static shell routes: Network First so deploys always serve fresh HTML
  event.respondWith(networkFirstWithCache(request, STATIC_CACHE));
});

// ── Strategy helpers ──────────────────────────────────────────────────────────

async function cacheFirstWithNetwork(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline fallback
    const offline = await caches.match("/offline");
    return offline || new Response("Sin conexión", { status: 503 });
  }
}

async function networkFirstWithCache(request, cacheName) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    clearTimeout(timeoutId);
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "Sin conexión." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ── Push notifications ────────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "JustIA Consumidor", body: event.data.text() };
  }

  const options = {
    body: data.body ?? "Tenés una nueva actualización en tu caso.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-72.png",
    tag: data.tag ?? "justia-notification",
    renotify: true,
    requireInteraction: false,
    data: { url: data.url ?? "/notificaciones" },
    actions: data.url
      ? [{ action: "open", title: "Ver caso" }]
      : [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title ?? "JustIA Consumidor", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/notificaciones";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) {
        existing.focus();
        existing.navigate(url);
      } else {
        self.clients.openWindow(url);
      }
    })
  );
});
