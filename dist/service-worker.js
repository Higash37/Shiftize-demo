// service-worker.js - 改善されたキャッシュ戦略

const CACHE_NAME = "shift-scheduler-v1";
const STATIC_CACHE_NAME = "shift-scheduler-static-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // 非GET や オリジン外のリクエストは素通りさせる
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(request.url);

  // 静的アセット（画像、フォント、CSS、JS）はCache First戦略
  if (
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot|css|js)$/i) ||
    url.pathname.startsWith("/_expo/static/")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          // レスポンスをクローンしてキャッシュに保存
          const responseClone = response.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        }).catch(() => {
          // オフライン時はキャッシュから返す
          return caches.match(request) || new Response("", { status: 503 });
        });
      })
    );
    return;
  }

  // APIリクエストやHTMLはNetwork First戦略
  event.respondWith(
    fetch(request)
      .then((response) => {
        // レスポンスをクローンしてキャッシュに保存
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから取得
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response("", { status: 503 });
        });
      })
  );
});
