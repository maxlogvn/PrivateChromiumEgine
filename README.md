# Chromium Anti-Detect Engine

[![npm version](https://img.shields.io/npm/v/fingerprint-chromium-engine.svg)](https://www.npmjs.com/package/fingerprint-chromium-engine)
[![Chromium](https://img.shields.io/badge/chromium-149.0.7827.3-blue.svg)](https://www.chromium.org/Home)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/playwright-compatible-2ea44f.svg)](https://playwright.dev)

Thư viện điều khiển trình duyệt Chromium chống bot detection, tích hợp fingerprint, proxy và quản lý profile đa phiên.

Engine không sinh fingerprint ngẫu nhiên. 
Thay vào đó, nó sử dụng fingerprint thu thập từ thiết bị thực tế, rồi inject trực tiếp vào Chromium ở cấp độ C/C++ trước khi trình duyệt chạy
Mọi thuộc tính đều trả về giá trị native,
không có dấu hiệu bị override dưới bất kỳ hình thức kiểm tra nào.

không chỉ định tuyến traffic. Nó tự động đồng bộ toàn bộ môi trường trình duyệt theo IP proxy, tự động set WebRTC IP, local theo proxy

Duy trì trạng thái đăng nhập, cookies, localStorage và lịch sử giữa các lần chạy:
- Mỗi profile độc lập, được lưu theo đường dẫn tùy chọn
- Tự động khôi phục fingerprint và proxy đã dùng ở phiên trước
- Lưu profile khi đóng -- có thể chỉ định đường dẫn lưu khác nhau mỗi lần để tái sử dụng

Được xây dựng trên nền `playwright-core` -- tương thích hoàn toàn với Playwright API hiện có, không cần viết lại code nghiệp vụ.

**Tài liệu:** [Documentation](https://playwright.dev) | [API Reference](https://playwright.dev/docs/api/class-playwright)
**Mã nguồn:** [GitHub](https://github.com/maxlogvn/PrivateChromiumEngine)
**NPM:** [fingerprint-chromium-engine](https://www.npmjs.com/package/fingerprint-chromium-engine)

---

## Yêu cầu hệ thống

> [!WARNING]
> Engine chỉ hoạt động trên hệ điều hành Windows, không thể cài đặt và sử dụng trên Linux, macOS và các hệ thống khác!

---

## Cài đặt

```bash
npm install fingerprint-chromium-engine
```

Nếu dự án chưa có `playwright-core`, cần cài thêm:

```bash
npm install playwright-core
```

---

## Bắt đầu nhanh

```ts
import { Chromium } from 'fingerprint-chromium-engine';

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
> [Ghi Chú]
> 
> Tất cả method cấu hình (`use*`) trả về `this`, hỗ trợ method chaining.
> Các method `use*` phải gọi trước `launch()`. Sau khi `launch()`, cấu hình bị khóa.



---


## Hướng dẫn sử dụng 

### Fingerprint

```ts
Chromium.useFingerprint(fingerprintData, {
    usePerfectCanvas: true,   // Canvas chính xác theo fingerprint
    safeWebGL: true,          // Che giấu GPU renderer và vendor
    safeAudio: true,          // Che giấu thông tin audio hardware
    useFontPack: true,        // Đồng bộ font với fingerprint mục tiêu
})
```

`useFontPack` yêu cầu cài đặt [FontPack từ Bablosoft](https://wiki.bablosoft.com/doku.php?id=fontpack). Nếu chưa cài, engine tự fallback.

| Tùy chọn | Mô tả | Mặc định |
|---|---|---|
| `emulateDeviceScaleFactor` | Giả lập màn hình HiDPI/Retina. Render ở độ phân giải cao hơn, tốn thêm tài nguyên. Các giá trị JS như `devicePixelRatio` luôn được thay thế đúng dù bật hay tắt | `true` |
| `emulateSensorAPI` | Giả lập Sensor API (gia tốc kế, con quay hồi chuyển). Nên bật khi giả lập fingerprint thiết bị di động | `true` |
| `usePerfectCanvas` | Thay thế dữ liệu Canvas chính xác theo fingerprint. Yêu cầu fingerprint phải chứa dữ liệu PerfectCanvas | `true` |
| `useFontPack` | Đồng bộ font hệ thống theo fingerprint, tránh sai lệch khi fingerprint mục tiêu có nhiều font hơn máy hiện tại | `true` |
| `safeElementSize` | Che giấu tọa độ thực của DOM element, chống ClientRects fingerprinting | `false` |
| `safeBattery` | Giả lập Battery API với giá trị khác nhau mỗi phiên. Trả về 100% nếu thiết bị gốc không có Battery API | `true` |
| `safeCanvas` | Thêm nhiễu vào Canvas 2D để chống canvas fingerprinting | `true` |
| `safeAudio` | Thêm nhiễu vào Web Audio API, che giấu sample rate và số kênh âm thanh | `true` |
| `safeWebGL` | Thêm nhiễu vào WebGL, che giấu tên GPU renderer và vendor | `true` |

---

### Proxy

```ts
Chromium.useProxy('http://user:pass@127.0.0.1:8080', {
    changeBrowserLanguage: true, // Đồng bộ ngôn ngữ trình duyệt theo quốc gia proxy
    changeTimezone: true,        // Đồng bộ múi giờ theo IP proxy
    changeGeolocation: false,    // Đồng bộ vị trí địa lý (mặc định tắt)
    changeWebRTC: 'replace',     // Thay IP WebRTC bằng IP proxy
})
```

#### Tùy chọn cơ bản

| Tùy chọn | Mô tả | Mặc định |
|---|---|---|
| `changeBrowserLanguage` | Đổi `Accept-Language` và `navigator.language` theo quốc gia proxy | `true` |
| `changeTimezone` | Đổi múi giờ trình duyệt theo IP proxy | `true` |
| `changeGeolocation` | Đổi geolocation theo IP proxy. Nếu tắt, trình duyệt từ chối mọi yêu cầu truy cập vị trí | `false` |
| `enableTunneling` | Bật/tắt hệ thống tunneling tích hợp. Tắt khi đã có VPN hoặc muốn kết nối trực tiếp | `true` |
| `enableQUIC` | Bật giao thức QUIC (UDP). Chỉ bật nếu proxy server hỗ trợ UDP | `false` |

#### Tùy chọn WebRTC

| Giá trị `changeWebRTC` | Hành vi |
|---|---|
| `enable` | Bật WebRTC -- lộ IP thật |
| `disable` | Tắt hoàn toàn WebRTC |
| `replace` | Thay IP WebRTC bằng IP proxy (khuyến nghị) |

Khi dùng `changeWebRTC: 'replace'`, có thể kiểm soát chi tiết IP hiển thị qua WebRTC:

```ts
Chromium.useProxy('http://...', {
    changeWebRTC: 'replace',
    publicIPv4: 'auto',     // tự lấy IPv4 công khai từ proxy
    publicIPv6: 'disable',  // ẩn IPv6 công khai
    privateIPv4: 'local',   // dùng IP nội bộ thực của máy
    privateIPv6: 'disable', // ẩn IPv6 nội bộ
})
```

| Tùy chọn | Mô tả | Mặc định |
|---|---|---|
| `publicIPv4` | IPv4 công khai hiển thị qua WebRTC. Nhận `'auto'`, `'disable'` hoặc IP cụ thể | `'auto'` |
| `publicIPv6` | IPv6 công khai hiển thị qua WebRTC. Nhận `'auto'`, `'disable'` hoặc IP cụ thể | `'auto'` |
| `privateIPv4` | IPv4 nội bộ hiển thị qua WebRTC. Nhận `'local'`, `'disable'`, IP cụ thể hoặc dải `'private class a/b/c'` | `'local'` |
| `privateIPv6` | IPv6 nội bộ hiển thị qua WebRTC. Nhận `'local'`, `'disable'`, IP cụ thể hoặc `'unique local address'` | `'local'` |

#### Tùy chọn tra cứu IP

| Tùy chọn | Mô tả | Mặc định |
|---|---|---|
| `detectExternalIP` | Tự động phát hiện IP công khai thực qua proxy. Hữu ích khi IP kết nối proxy khác IP hiển thị ra ngoài. Có thể cấu hình riêng cho IPv4/IPv6 | `true` |
| `ipInfoMethod` | Phương thức tra cứu thông tin địa lý từ IP. `'database'` -- nội bộ, nhanh nhưng kém chính xác. `'ip-api.com'` -- bên ngoài, chính xác hơn nhưng giới hạn 45 request/phút/IP (bản free) | `'database'` |
| `ipInfoKey` | API key của [ip-api.com](https://ip-api.com/) bản trả phí. Chỉ có hiệu lực khi `ipInfoMethod` là `'ip-api.com'` | `''` |

#### Tùy chọn nguồn lấy IP tùy chỉnh

Dùng khi cần lấy IP công khai từ một service riêng thay vì service mặc định:

```ts
Chromium.useProxy('http://...', {
    ipExtractionURL: 'https://api.myservice.com/ip',
    ipExtractionMethod: 'jsonpath',
    ipExtractionParam: '$.ip',
})
```

Có thể cấu hình riêng cho IPv4 và IPv6:

```ts
Chromium.useProxy('http://...', {
    ipExtractionURL: { v4: 'https://ipv4.service.com', v6: 'https://ipv6.service.com' },
    ipExtractionMethod: { v4: 'raw', v6: 'jsonpath' },
    ipExtractionParam: { v4: '', v6: '$.ip' },
})
```

| Tùy chọn | Mô tả | Mặc định |
|---|---|---|
| `ipExtractionURL` | URL trả về địa chỉ IP công khai hiện tại qua proxy | `''` |
| `ipExtractionMethod` | Phương thức trích xuất IP từ response: `'raw'`, `'jsonpath'`, `'xpath'`, `'regexp'` | `'raw'` |
| `ipExtractionParam` | Tham số dùng để trích xuất, kết hợp với `ipExtractionMethod` | `''` |

#### Tùy chọn DNS

```ts
Chromium.useProxy('http://...', {
    dnsMode: 'custom-direct', // phân giải DNS cục bộ, traffic còn lại qua proxy
    dnsIP: '1.1.1.1',
})
```

| Giá trị `dnsMode` | Hành vi |
|---|---|
| `system-proxy` | Dùng DNS hệ thống, hostname được gửi đến proxy để phân giải |
| `custom-proxy` | Dùng DNS tùy chỉnh của Chrome, truy vấn DNS qua proxy (proxy phải hỗ trợ UDP) |
| `custom-direct` | Dùng DNS tùy chỉnh của Chrome, phân giải DNS cục bộ, traffic còn lại qua proxy (khuyến nghị) |

Lưu ý:
- Khi dùng `custom-proxy` hoặc `custom-direct`, cần chỉ định `dnsIP`. Mặc định `dnsIP` là `'1.1.1.1'`.
- `custom-proxy` yêu cầu proxy hỗ trợ UDP. Nếu proxy chỉ hỗ trợ TCP, dùng `custom-direct` hoặc `system-proxy`.

---

### Profile

```ts
// Lần đầu -- tạo mới profile
Chromium.useProfile('./profiles/user_01')

// Các lần sau -- tự động khôi phục session, proxy, fingerprint
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

### Thay thế Chromium launcher

Engine đi kèm một bản Chromium đã được patch sẵn để chống detection. Trong trường hợp đặc biệt, có thể thay thế bằng launcher tùy chỉnh:

```ts
Chromium.repackChromium(customLauncher)
```

Cảnh báo: Chỉ dùng `repackChromium()` khi có lý do đặc biệt và hiểu rõ rủi ro. Launcher tùy chỉnh có thể không được patch đầy đủ, dẫn đến tăng nguy cơ bị detect.

---

### Vòng đời trình duyệt

```
Bước 1: Cấu hình (có thể chaining)
  Chromium.useFingerprint(data).useProxy('http://...').useProfile('./profiles/user_01')

Bước 2: Khởi tạo engine (chỉ gọi một lần)
  .launch({ headless: false })

Bước 3: Mở phiên duyệt
  const context = await Chromium.newContext();
  const page = await context.newPage();

Bước 4: Đóng và lưu
  await Chromium.quit();
```

Quy tắc:
- `launch()` chỉ được gọi một lần. Gọi lại sẽ ném lỗi.
- `newContext()` chỉ cho phép một context tại một thời điểm. Gọi `quit()` trước khi tạo context mới.
- Thứ tự gọi đúng: `use*` --> `launch()` --> `newContext()` --> `quit()`. Sai thứ tự sẽ ném lỗi có mô tả rõ ràng.

---

## Lưu ý quan trọng

**changeGeolocation mặc định tắt** -- Khi tắt, trình duyệt từ chối mọi yêu cầu truy cập vị trí từ trang web.

**ip-api.com giới hạn rate** -- Bản free giới hạn 45 request/phút/IP. Vượt quá giới hạn nhận HTTP 429. Cân nhắc dùng bản Pro với `ipInfoKey` hoặc chuyển về `ipInfoMethod: 'database'` khi scale lớn.

**FontPack cần cài đặt riêng** -- Tải và cài đặt từ [Bablosoft Wiki](https://wiki.bablosoft.com/doku.php?id=fontpack) để `useFontPack` hoạt động đúng. Nếu chưa cài, engine tự fallback.

**Thứ tự gọi bắt buộc** -- `use*` --> `launch()` --> `newContext()` --> `quit()`. Sai thứ tự sẽ ném lỗi có mô tả rõ ràng.

**Chỉ hỗ trợ Windows** -- Engine hiện tại chỉ chạy trên hệ điều hành Windows.

---

## Đóng góp và Hỗ trợ

Gặp vấn đề hoặc muốn đề xuất tính năng -- tạo Issue hoặc Pull Request tại:

https://github.com/maxlogvn/PrivateChromiumEngine/issues
