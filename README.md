# Chromium Anti-Detect Engine

Thư viện điều khiển trình duyệt Chromium chống bot detection, tích hợp fingerprint, proxy và quản lý profile đa phiên.

Được xây dựng trên nền `playwright-core` — tương thích hoàn toàn với Playwright API hiện có, không cần viết lại code nghiệp vụ.

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Playwright Compatible](https://img.shields.io/badge/Playwright-Compatible-2ea44f)](https://playwright.dev/)

---

## Tính năng

### Fingerprint từ thiết bị thật, inject ở tầng C native

Không sinh fingerprint ngẫu nhiên — engine sử dụng fingerprint thu thập từ các thiết bị thực tế, sau đó inject trực tiếp vào Chromium ở cấp độ C/C++. Kết quả là mọi thuộc tính đều trả về giá trị native, không có dấu hiệu bị override dưới bất kỳ hình thức kiểm tra nào.

**Navigator & Platform**
- Navigator properties (thiết bị, trình duyệt, locale, OS...)
- Network headers `Accept-Language` và `User-Agent` tự động khớp với navigator
- Kích thước & độ phân giải màn hình, inner/outer viewport
- `devicePixelRatio` & HiDPI/Retina screen emulation

**Đồ họa**
- WebGL parameters, supported extensions, context attributes & shader precision formats
- Canvas 2D — thêm nhiễu chống canvas fingerprinting
- Font fingerprinting (hỗ trợ FontPack đồng bộ font hệ thống)

**Media & Hardware**
- AudioContext sample rate, output latency & max channel count
- Device voices & speech playback rates
- Số lượng microphone, webcam, speaker available
- Battery API, Sensor API (gia tốc kế, con quay hồi chuyển)
- ClientRects & DOM element coordinates

**Mạng & Vị trí**
- WebRTC IP spoofing ở tầng protocol — không thể bị detect qua JS
- Geolocation, timezone & locale

### Proxy & Môi trường thông minh

Không chỉ định tuyến traffic — engine tự động đồng bộ toàn bộ môi trường trình duyệt theo IP proxy:

- **Timezone** — múi giờ tự động khớp với vị trí địa lý của proxy
- **Ngôn ngữ** — `Accept-Language`, `navigator.language` theo quốc gia proxy
- **Geolocation** — vị trí địa lý theo IP (tuỳ chọn)
- **WebRTC** — che giấu hoặc thay thế IP rò rỉ qua WebRTC
- **DNS tùy chỉnh** — hỗ trợ `custom-proxy` và `custom-direct` để tránh DNS leak
- **QUIC** — tùy chọn bật giao thức QUIC nếu proxy hỗ trợ UDP

### Profile đa phiên

Duy trì trạng thái đăng nhập, cookies, localStorage và lịch sử giữa các lần chạy:

- Mỗi profile độc lập, được lưu theo đường dẫn tùy chọn
- Tự động khôi phục fingerprint và proxy đã dùng ở phiên trước
- Lưu profile khi đóng — có thể chỉ định đường dẫn lưu khác nhau mỗi lần

### Tương thích Playwright 100%

Trả về `BrowserContext` chuẩn của `playwright-core`. Toàn bộ API Playwright (`page`, `locator`, `expect`, `route`...) hoạt động bình thường — không cần thay đổi code nghiệp vụ.

---

## Cài đặt

 Cài đặt trực tiếp từ GitHub:

```bash
# npm
npm install github:maxlogvn/PrivateBrowser playwright-core

# yarn
yarn add github:maxlogvn/PrivateBrowser playwright-core

# bun
bun add github:maxlogvn/PrivateBrowser playwright-core
```

> `playwright-core` là peer dependency — cần cài kèm để thư viện hoạt động.

---

## Bắt đầu nhanh

```ts
import { Chromium } from 'playwright-browser-manager';

const context = await Chromium
  .useFingerprint(fingerprintData)
  .useProxy('http://user:pass@127.0.0.1:8080')
  .useProfile('./profiles/user_01')
  .launch({ headless: false })
  .newContext();

const page = await context.newPage();
await page.goto('https://example.com');

await Chromium.quit();
```

> Tất cả method cấu hình (`use*`) trả về `this` — hỗ trợ method chaining.  
> Bắt buộc gọi trước `launch()`. Sau khi `launch()`, cấu hình bị khóa.

---

## Hướng dẫn sử dụng

### Fingerprint

```ts
Chromium.useFingerprint(fingerprintData, {
  usePerfectCanvas: true,   // Canvas chính xác theo fingerprint
  safeWebGL: true,          // Che giấu GPU renderer & vendor
  safeAudio: true,          // Che giấu thông tin audio hardware
  useFontPack: true,        // Đồng bộ font với fingerprint mục tiêu
})
```

> `useFontPack` yêu cầu cài đặt [FontPack từ Bablosoft](https://wiki.bablosoft.com/doku.php?id=fontpack). Nếu chưa cài, engine tự fallback.

| Tùy chọn | Mô tả | Mặc định |
|---|---|---|
| `emulateDeviceScaleFactor` | Giả lập màn hình HiDPI/Retina | `true` |
| `emulateSensorAPI` | Giả lập cảm biến di động | `true` |
| `usePerfectCanvas` | Canvas chính xác từ fingerprint | `true` |
| `useFontPack` | Đồng bộ font hệ thống | `true` |
| `safeElementSize` | Che giấu tọa độ DOM element | `false` |
| `safeBattery` | Giả lập Battery API | `true` |
| `safeCanvas` | Thêm nhiễu Canvas 2D | `true` |
| `safeAudio` | Thêm nhiễu Web Audio | `true` |
| `safeWebGL` | Thêm nhiễu WebGL | `true` |

---

### Proxy

```ts
Chromium.useProxy('http://user:pass@127.0.0.1:8080', {
  changeTimezone: true,        // Đồng bộ múi giờ theo IP proxy
  changeGeolocation: true,     // Đồng bộ vị trí địa lý
  changeBrowserLanguage: true, // Đồng bộ ngôn ngữ trình duyệt
  changeWebRTC: 'replace',     // Thay IP WebRTC bằng IP proxy
})
```

**Tùy chọn DNS:**

```ts
Chromium.useProxy('http://...', {
  dnsMode: 'custom-direct', // phân giải DNS cục bộ, traffic còn lại qua proxy
  dnsIP: '1.1.1.1',
})
```

> `custom-proxy` yêu cầu proxy hỗ trợ UDP. Nếu proxy chỉ hỗ trợ TCP, dùng `custom-direct` hoặc `system-proxy`.

**Tùy chọn WebRTC:**

| Giá trị | Hành vi |
|---|---|
| `enable` | Bật WebRTC — lộ IP thật |
| `disable` | Tắt hoàn toàn WebRTC |
| `replace` | Thay IP WebRTC bằng IP proxy *(khuyến nghị)* |

---

### Profile

```ts
// Lần đầu — tạo mới profile
Chromium.useProfile('./profiles/user_01')

// Các lần sau — tự động khôi phục session, proxy, fingerprint
Chromium.useProfile('./profiles/user_01', {
  loadProxy: true,       // khôi phục proxy từ phiên trước
  loadFingerprint: true, // khôi phục fingerprint từ phiên trước
})
```

Profile tự động lưu khi gọi `quit()`. Có thể ghi đè đường dẫn lưu:

```ts
await Chromium.quit('./profiles/user_01_backup');
```

---

### Vòng đời trình duyệt

```ts
// 1. Cấu hình (có thể chaining)
Chromium
  .useFingerprint(data)
  .useProxy('http://...')
  .useProfile('./profiles/user_01')

// 2. Khởi tạo engine — chỉ gọi một lần
  .launch({ headless: false })

// 3. Mở phiên duyệt
const context = await Chromium.newContext();
const page = await context.newPage();

// 4. Đóng và lưu
await Chromium.quit();
```

> `launch()` chỉ được gọi **một lần**. Gọi lại sẽ ném lỗi.  
> `newContext()` chỉ cho phép một context tại một thời điểm. Gọi `quit()` trước khi tạo context mới.

---

## Lưu ý

**IP Geolocation với ip-api.com** — bản free giới hạn 45 request/phút/IP. Vượt quá giới hạn nhận HTTP 429. Cân nhắc dùng bản Pro hoặc chuyển về `ipInfoMethod: 'database'` khi scale lớn.

**FontPack** — cần tải và cài đặt riêng từ [Bablosoft Wiki](https://wiki.bablosoft.com/doku.php?id=fontpack) để `useFontPack` hoạt động đúng.

**Thứ tự gọi** — `use*` → `launch()` → `newContext()` → `quit()`. Sai thứ tự sẽ ném lỗi có mô tả rõ ràng.

---

## Đóng góp & Hỗ trợ

Gặp vấn đề hoặc muốn đề xuất tính năng — tạo [Issue](../../issues) hoặc [Pull Request](../../pulls).

