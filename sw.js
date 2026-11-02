// 보장설계 매니저 — 오프라인용 서비스 워커
// 화면 파일(index.html)만 이 기기에 보관한다. 인터넷이 되면 항상 새 파일을 받고(최신 유지), 안 되면 보관본으로 연다.
// 고객 자료는 여기서 다루지 않는다(앱이 IndexedDB 사본으로 관리).
var CACHE = 'fcp-shell-v1';
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.add('./'); }).catch(function () {}));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || r.mode !== 'navigate') return;
  if (new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(function (res) {
    if (res && res.ok) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put('./', cp); }); }
    return res;
  }).catch(function () { return caches.match('./').then(function (m) { return m || caches.match(r); }); }));
});
