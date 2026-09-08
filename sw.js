const cacheName = 'weitv-pro-v2'; // 🔄 เปลี่ยนชื่อเมื่ออัปเดต
const staticAssets = [
  './',
  './index.html',
  './manifest.json',
  './player.html' // ✅ เพิ่มหน้าเครื่องเล่น
];

// 📌 ติดตั้ง + แคชไฟล์
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(staticAssets))
      .then(() => self.skipWaiting()) // ✅ บังคับใช้เวอร์ชันใหม่ทันที
  );
});

// 📌 ลบแคชเก่าเมื่อมีเวอร์ชันใหม่
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names => {
      return names.filter(name => name !== cacheName)
        .map(name => caches.delete(name));
    }).then(() => self.clients.claim()) // ✅ ควบคุมแท็บทั้งหมด
  );
});

// 📌 ดึงข้อมูล — กฎ: แคชก่อน → ถ้าไม่มีต่อเน็ต
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // ✅ ข้ามคำขอที่ไม่ใช่ของเรา (เช่น Firebase, ไลบรารีภายนอก)
  if (req.url.startsWith('http') && 
      !req.url.includes('sugus25.github.io') && 
      !req.url.includes('fonts.googleapis.com') &&
      !req.url.includes('cdnjs.cloudflare.com') &&
      !req.url.includes('cdn.jsdelivr.net')) {
    return; // ไม่แคชสตรีมวิดีโอ/ลิงก์ภายนอก
  }

  // ✅ ไม่แคชคำขอ POST (Firebase)
  if (req.method !== 'GET') return;

  event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  
  if (cached) {
    // ✅ มีในแคช → ส่งแคช + อัปเดตแคชเบื้องหลัง
    fetch(req).then(res => {
      cache.put(req, res.clone());
    }).catch(() => {});
    return cached;
  }
  
  // ❌ ไม่มีในแคช → ดึงจากเน็ต + เก็บแคช
  try {
    const res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  } catch (e) {
    // 🔴 ออฟไลน์ + ไม่มีแคช → แสดงหน้าออฟไลน์
    return caches.match('./index.html');
  }
}
