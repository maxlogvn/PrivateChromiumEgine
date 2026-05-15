import { BrowserType, BrowserContext } from 'playwright-core';

/**
 * Tùy chọn cấu hình profile cho trình duyệt.
 *
 * @example
 * ```ts
 * browser.useProfile('./profiles/user_01', {
 *   loadProxy: true,
 *   loadFingerprint: true,
 * });
 * ```
 */
interface ProfileOptions {
    /**
     * Tự động load proxy đã dùng lần trước từ thư mục profile.
     *
     * @default true
     */
    loadProxy?: boolean;
    /**
     * Tự động load fingerprint đã dùng lần trước từ thư mục profile.
     *
     * @default true
     */
    loadFingerprint?: boolean;
}

/**
 * Tùy chọn kiểm soát các kỹ thuật giả lập fingerprint trên trình duyệt.
 *
 * @example
 * ```ts
 * browser.useFingerprint(data, {
 *   usePerfectCanvas: true,
 *   safeWebGL: true,
 *   safeAudio: true,
 * });
 * ```
 */
interface FingerprintOptions {
    /**
     * Giả lập màn hình mật độ pixel cao (HiDPI/Retina) theo fingerprint.
     * Trình duyệt sẽ render ở độ phân giải cao hơn, tốn thêm tài nguyên hệ thống.
     * Các giá trị JS liên quan như `devicePixelRatio` luôn được thay thế đúng dù bật hay tắt.
     *
     * @default true
     */
    emulateDeviceScaleFactor?: boolean;
    /**
     * Giả lập Sensor API (gia tốc kế, con quay hồi chuyển...) theo fingerprint.
     * Nên bật khi giả lập fingerprint thiết bị di động.
     *
     * @default true
     */
    emulateSensorAPI?: boolean;
    /**
     * Bật chế độ PerfectCanvas để thay thế dữ liệu Canvas chính xác theo fingerprint.
     * Yêu cầu fingerprint phải chứa dữ liệu PerfectCanvas.
     *
     * @default true
     */
    usePerfectCanvas?: boolean;
    /**
     * Cho phép dùng bộ FontPack (nếu đã cài) để đồng bộ font với fingerprint.
     * Tránh sai lệch khi fingerprint mục tiêu có nhiều font hơn hệ thống hiện tại.
     *
     * Tải FontPack tại: https://wiki.bablosoft.com/doku.php?id=fontpack
     *
     * @default true
     */
    useFontPack?: boolean;
    /**
     * Che giấu tọa độ thực của DOM element, chống lại kỹ thuật ClientRects fingerprinting.
     *
     * @default false
     */
    safeElementSize?: boolean;
    /**
     * Giả lập Battery API với giá trị khác nhau cho mỗi phiên.
     * Nếu thiết bị gốc không có Battery API, luôn trả về 100%.
     *
     * @default true
     */
    safeBattery?: boolean;
    /**
     * Thêm nhiễu vào dữ liệu Canvas 2D để chống canvas fingerprinting.
     *
     * @default true
     */
    safeCanvas?: boolean;
    /**
     * Thêm nhiễu vào Web Audio API, che giấu thông tin phần cứng âm thanh
     * như sample rate và số kênh âm thanh.
     *
     * @default true
     */
    safeAudio?: boolean;
    /**
     * Thêm nhiễu vào WebGL, che giấu thông tin GPU
     * như tên nhà sản xuất và renderer của card đồ họa.
     *
     * @default true
     */
    safeWebGL?: boolean;
}

/**
 * Phương thức trích xuất địa chỉ IP từ response của service URL.
 *
 * - `raw` - Lấy toàn bộ nội dung response làm IP.
 * - `xpath` - Trích xuất IP bằng biểu thức XPath.
 * - `regexp` - Trích xuất IP bằng biểu thức chính quy.
 * - `jsonpath` - Trích xuất IP bằng biểu thức JSONPath.
 */
type IPExtractionMethod = 'raw' | 'xpath' | 'regexp' | 'jsonpath';
/**
 * Giá trị thay thế cho địa chỉ IP nội bộ (private IP) trong WebRTC.
 *
 * - `disable` - Không hiển thị IP nội bộ.
 * - `local` - Dùng địa chỉ IP nội bộ thực của máy.
 * - Hoặc truyền vào một địa chỉ IP cụ thể.
 */
type PrivateIPReplacement = IPString | 'disable' | 'local';
/**
 * Giá trị thay thế cho địa chỉ IP công khai (public IP) trong WebRTC.
 *
 * - `disable` - Không hiển thị IP công khai.
 * - `auto` - Tự động lấy IP công khai từ proxy.
 * - Hoặc truyền vào một địa chỉ IP cụ thể.
 */
type PublicIPReplacement = IPString | 'disable' | 'auto';
/**
 * Bất kỳ chuỗi nào có thể được dùng làm địa chỉ IP.
 */
type IPString = string & {};
/**
 * Tùy chọn cấu hình proxy cho trình duyệt.
 *
 * @example
 * ```ts
 * browser.useProxy('http://user:pass@host:port', {
 *   changeBrowserLanguage: true,
 *   changeTimezone: true,
 *   changeWebRTC: 'replace',
 *   enableTunneling: true,
 * });
 * ```
 */
interface ProxyOptions {
    /**
     * Tự động đổi ngôn ngữ trình duyệt theo quốc gia của proxy.
     * Ảnh hưởng đến header `Accept-Language` và `navigator.language`.
     *
     * @default true
     */
    changeBrowserLanguage?: boolean;
    /**
     * Đổi vị trí địa lý (geolocation) của trình duyệt theo IP của proxy.
     * Nếu tắt, trình duyệt sẽ từ chối mọi yêu cầu truy cập vị trí.
     *
     * @default false
     */
    changeGeolocation?: boolean;
    /**
     * Đổi múi giờ trình duyệt theo IP của proxy.
     *
     * @default true
     */
    changeTimezone?: boolean;
    /**
     * Cấu hình hành vi WebRTC.
     *
     * - `enable` - Bật WebRTC, lộ IP thật.
     * - `disable` - Tắt hoàn toàn WebRTC.
     * - `replace` - Thay thế IP trong WebRTC bằng IP của proxy.
     *
     * @default 'replace'
     */
    changeWebRTC?: 'enable' | 'disable' | 'replace';
    /**
     * Địa chỉ IPv4 công khai hiển thị qua WebRTC.
     * Chỉ có hiệu lực khi `changeWebRTC` là `replace`.
     *
     * @default 'auto'
     */
    publicIPv4?: PublicIPReplacement;
    /**
     * Địa chỉ IPv6 công khai hiển thị qua WebRTC.
     * Chỉ có hiệu lực khi `changeWebRTC` là `replace`.
     *
     * @default 'auto'
     */
    publicIPv6?: PublicIPReplacement;
    /**
     * Địa chỉ IPv4 nội bộ hiển thị qua WebRTC.
     * Chỉ có hiệu lực khi `changeWebRTC` là `replace`.
     *
     * @default 'local'
     */
    privateIPv4?: PrivateIPReplacement | 'private class a' | 'private class b' | 'private class c';
    /**
     * Địa chỉ IPv6 nội bộ hiển thị qua WebRTC.
     * Chỉ có hiệu lực khi `changeWebRTC` là `replace`.
     *
     * @default 'local'
     */
    privateIPv6?: PrivateIPReplacement | 'unique local address';
    /**
     * Phương thức trích xuất IP từ response của `ipExtractionURL`.
     * Cần dùng kết hợp với `ipExtractionParam`.
     * Có thể cấu hình riêng cho IPv4 và IPv6 bằng object notation.
     *
     * @default 'raw'
     */
    ipExtractionMethod?: IPExtractionMethod | {
        v4: IPExtractionMethod;
        v6: IPExtractionMethod;
    };
    /**
     * Tham số dùng để trích xuất IP từ response của `ipExtractionURL`.
     * Cần dùng kết hợp với `ipExtractionMethod`.
     * Có thể cấu hình riêng cho IPv4 và IPv6 bằng object notation.
     *
     * @default ''
     */
    ipExtractionParam?: string | {
        v4: string;
        v6: string;
    };
    /**
     * URL dùng để xác định IP công khai hiện tại qua proxy.
     * Response phải chứa địa chỉ IP.
     * Có thể cấu hình riêng cho IPv4 và IPv6 bằng object notation.
     *
     * @default ''
     */
    ipExtractionURL?: string | {
        v4: string;
        v6: string;
    };
    /**
     * Tự động phát hiện IP công khai bằng cách truy vấn service bên ngoài.
     * Hữu ích khi IP kết nối proxy khác với IP hiển thị ra bên ngoài.
     * Có thể cấu hình riêng cho IPv4 và IPv6 bằng object notation.
     *
     * @default true
     */
    detectExternalIP?: boolean | {
        v4: boolean;
        v6: boolean;
    };
    /**
     * Phương thức tra cứu thông tin địa lý từ địa chỉ IP.
     *
     * - `database` - Dùng database nội bộ, nhanh nhưng kém chính xác hơn.
     * - `ip-api.com` - Dùng service bên ngoài, chính xác hơn nhưng giới hạn 45 request/IP (bản free).
     *
     * @default 'database'
     */
    ipInfoMethod?: 'database' | 'ip-api.com';
    /**
     * API key của dịch vụ [ip-api.com](https://ip-api.com/) (bản trả phí).
     * Chỉ có hiệu lực khi `ipInfoMethod` là `ip-api.com`.
     *
     * @default ''
     */
    ipInfoKey?: string;
    /**
     * Bật/tắt hệ thống tunneling tích hợp.
     * Nếu tắt, proxy sẽ không hoạt động — dùng khi đã có VPN hoặc muốn kết nối trực tiếp.
     *
     * @default true
     */
    enableTunneling?: boolean;
    /**
     * Bật giao thức QUIC (chạy trên UDP).
     * Chỉ bật nếu proxy server hỗ trợ UDP.
     *
     * @default false
     */
    enableQUIC?: boolean;
    /**
     * Chế độ phân giải DNS.
     *
     * - `system-proxy` - Dùng DNS hệ thống, hostname được gửi đến proxy để phân giải.
     * - `custom-proxy` - Dùng DNS tùy chỉnh của Chrome, truy vấn DNS qua proxy (proxy phải hỗ trợ UDP).
     * - `custom-direct` - Dùng DNS tùy chỉnh của Chrome, phân giải DNS cục bộ, traffic còn lại đi qua proxy.
     *
     * Khuyến nghị dùng `custom-direct` nếu muốn sử dụng DNS tùy chỉnh.
     * Lưu ý: cần chỉ định `dnsIP` khi dùng `custom-proxy` hoặc `custom-direct`.
     *
     * @default 'system-proxy'
     */
    dnsMode?: 'system-proxy' | 'custom-proxy' | 'custom-direct';
    /**
     * Địa chỉ IP của DNS server khi dùng chế độ `custom-proxy` hoặc `custom-direct`.
     * Không có hiệu lực khi `dnsMode` là `system-proxy`.
     *
     * @default '1.1.1.1'
     */
    dnsIP?: string;
}

/**
 * Khoảng thời gian lọc fingerprint theo ngày thu thập.
 * Dùng `*` để không giới hạn thời gian.
 */
type Time = '*' | '15 days' | '30 days' | '60 days';
/**
 * Tag lọc fingerprint theo thiết bị, hệ điều hành hoặc trình duyệt.
 * Dùng `*` để không lọc theo tag.
 */
type Tag = '*' | 'Desktop' | 'Mobile' | 'Microsoft Windows' | 'Apple Mac' | 'Android' | 'Linux' | 'iPad' | 'iPhone' | 'Edge' | 'Chrome' | 'Safari' | 'Firefox' | 'YaBrowser' | 'Windows 7' | 'Windows 8' | 'Windows 10';
/**
 * Tùy chọn lọc và lấy fingerprint từ service.
 *
 * @example
 * ```ts
 * const fingerprint = await fetchFingerprint({
 *   tags: ['Chrome', 'Desktop', 'Windows 10'],
 *   timeLimit: '30 days',
 *   minBrowserVersion: 'current',
 *   maxBrowserVersion: 'current',
 *   minWidth: 1280,
 *   minHeight: 720,
 * });
 * ```
 */
interface FetchOptions {
    /**
     * Lọc fingerprint theo tag thiết bị, hệ điều hành hoặc trình duyệt.
     * Không truyền để lấy fingerprint bất kỳ.
     */
    tags?: Tag[];
    /**
     * Lọc fingerprint theo ngày thu thập.
     * Không truyền để không giới hạn thời gian.
     */
    timeLimit?: Time;
    /**
     * Chiều rộng màn hình tối thiểu của fingerprint (px).
     */
    minWidth?: number;
    /**
     * Chiều rộng màn hình tối đa của fingerprint (px).
     */
    maxWidth?: number;
    /**
     * Chiều cao màn hình tối thiểu của fingerprint (px).
     */
    minHeight?: number;
    /**
     * Chiều cao màn hình tối đa của fingerprint (px).
     */
    maxHeight?: number;
    /**
     * Phiên bản trình duyệt tối thiểu của fingerprint.
     * Dùng `current` để tự động khớp với phiên bản trình duyệt đang cài.
     * Nên dùng kết hợp với tag trình duyệt cụ thể (ví dụ `Chrome`).
     */
    minBrowserVersion?: number | 'current';
    /**
     * Phiên bản trình duyệt tối đa của fingerprint.
     * Dùng `current` để tự động khớp với phiên bản trình duyệt đang cài.
     * Đặt bằng `minBrowserVersion` để lọc đúng một phiên bản cụ thể.
     */
    maxBrowserVersion?: number | 'current';
    /**
     * Bật logging khi lấy fingerprint có dữ liệu PerfectCanvas.
     *
     * @default false
     */
    perfectCanvasLogs?: boolean;
    /**
     * Dữ liệu PerfectCanvas request dùng để render canvas chính xác theo fingerprint.
     * Lấy request bằng ứng dụng CanvasInspector — xem hướng dẫn tại wiki của bablosoft.
     * Chỉ cần lấy một lần cho mỗi site, không cần lấy lại cho từng fingerprint.
     */
    perfectCanvasRequest?: string;
    /**
     * Chỉ lấy fingerprint từ custom server (yêu cầu tài khoản đã bật tính năng này).
     * Tương thích với PerfectCanvas.
     *
     * @default false
     */
    enableCustomServer?: boolean;
    /**
     * Cho phép render PerfectCanvas động từ các máy đang kết nối
     * khi fingerprint chưa có trong database tĩnh.
     * Tắt nếu muốn bỏ qua dynamic rendering để tiết kiệm thời gian.
     * Không có hiệu lực nếu không truyền `perfectCanvasRequest`.
     *
     * @default true
     */
    dynamicPerfectCanvas?: boolean;
    /**
     * Cho phép truy vấn database tĩnh trước khi dùng dynamic rendering.
     * Tắt nếu muốn bỏ qua database tĩnh và dùng dynamic rendering ngay lập tức.
     * Không có hiệu lực nếu không truyền `perfectCanvasRequest` hoặc đang dùng custom server.
     *
     * @default true
     */
    enablePrecomputedFingerprints?: boolean;
}

type PluginLaunchOptions = Parameters<BrowserType['launchPersistentContext']>[1];
type Launcher = Pick<BrowserType, 'launch' | 'launchPersistentContext'>;
/**
 * Factory function tao mot instance BrowserEngine moi.
 *
 * @example
 * const browser = Chromium
 *   .useFingerprint(fp)
 *   .useProxy(proxy)
 *   .launch();
 *
 * const context = await browser.newContext();
 */
declare const Chromium: ((privateKey?: string) => PWChromium) & {
    launch: (options?: Partial<PluginLaunchOptions>) => PWChromium;
};

/**
 * Interface điều khiển trình duyệt Chromium với hỗ trợ fingerprint, proxy và profile.
 *
 * Các method cấu hình (`useFingerprint`, `useProxy`, `useProfile`, `usePrivateKey`)
 * phải được gọi trước `launch()`. Sau khi `launch()` được gọi, cấu hình sẽ không thể thay đổi.
 *
 * @example
 * ```ts
 * const browser: PWChromium = new BrowserEngine();
 *
 * const context = await browser
 *   .usePrivateKey('your-private-key')
 *   .useFingerprint(fingerprintData, { usePerfectCanvas: true })
 *   .useProxy('http://user:pass@host:port', { changeTimezone: true })
 *   .useProfile('./profiles/user_01', { loadFingerprint: true })
 *   .launch({ headless: false })
 *   .newContext();
 *
 * const page = await context.newPage();
 * await page.goto('https://example.com');
 *
 * await browser.quit('./profiles/user_01'); // đóng và lưu profile
 * ```
 */
interface PWChromium {
    /**
     * Truy cập instance engine gốc (dùng cho các tác vụ nâng cao).
     * Lưu ý: Sử dụng thuộc tính này có thể bỏ qua một số lớp bảo vệ của API chuẩn.
     */
    readonly engine: object;
    /**
     * Thay thế Chromium mặc định bằng một launcher tùy chỉnh.
     *
     * Launcher mặc định đã được patch sẵn để chống detection — chỉ dùng method này
     * khi có lý do đặc biệt và hiểu rõ rủi ro bị detect.
     * Cần gọi trước `launch()`.
     *
     * @param launcher - Launcher tùy chỉnh thay thế Chromium mặc định.
     *
     * @example
     * browser.repackChromium(customLauncher)
     */
    repackChromium(launcher: object): this;
    /**
     * Gắn fingerprint vào trình duyệt để giả lập thiết bị, tránh bị detect.
     *
     * Fingerprint chứa thông tin phần cứng, màn hình, trình duyệt...
     * giúp trình duyệt trông như một thiết bị thật.
     * Cần gọi trước `launch()`.
     *
     * @param data - Chuỗi fingerprint lấy từ service bablosoft.
     * @param options - Tùy chọn kiểm soát các kỹ thuật giả lập, xem {@link FingerprintOptions}.
     *
     * @example
     * browser.useFingerprint(fingerprintData, {
     *   usePerfectCanvas: true,
     *   safeWebGL: true,
     * })
     */
    useFingerprint(data: string, options?: object): this;
    /**
     * Định tuyến toàn bộ traffic của trình duyệt qua proxy.
     *
     * Hỗ trợ các giao thức HTTP, HTTPS, SOCKS4, SOCKS5.
     * Cần gọi trước `launch()`.
     *
     * @param data - Proxy string theo định dạng `protocol://user:pass@host:port`.
     * @param options - Tùy chọn bổ sung như đổi timezone, geolocation, WebRTC... xem {@link ProxyOptions}.
     *
     * @example
     * browser.useProxy('http://user:pass@127.0.0.1:8080', {
     *   changeTimezone: true,
     *   changeGeolocation: true,
     *   changeWebRTC: 'replace',
     * })
     */
    useProxy(data: string, options?: object): this;
    /**
     * Liên kết thư mục profile với trình duyệt.
     *
     * Profile lưu trữ cookies, localStorage, session, lịch sử đăng nhập...
     * giúp duy trì trạng thái giữa các phiên. Profile sẽ tự động được lưu
     * về `dirPath` khi gọi `quit()`.
     * Cần gọi trước `launch()`.
     *
     * @param dirPath - Đường dẫn thư mục lưu profile.
     * @param options - Tùy chọn load proxy/fingerprint từ profile, xem {@link ProfileOptions}.
     *
     * @example
     * browser.useProfile('./profiles/user_01', {
     *   loadProxy: true,
     *   loadFingerprint: true,
     * })
     */
    useProfile(dirPath: string, options?: object): this;
    /**
     * Khởi tạo engine với toàn bộ cấu hình đã thiết lập.
     *
     * Bắt buộc phải gọi trước `newContext()`.
     * Chỉ được gọi một lần trong vòng đời của instance —
     * gọi lại sẽ ném lỗi.
     *
     * @param options - Override các tùy chọn launch mặc định (headless, viewport...).
     * @throws {Error} Nếu gọi lại sau khi đã launch.
     *
     * @example
     * browser.launch({ headless: false })
     */
    launch(options?: object): this;
    /**
     * Tạo một `BrowserContext` để bắt đầu phiên duyệt web.
     *
     * Bắt buộc phải gọi `launch()` trước. Mỗi instance chỉ cho phép
     * một context tồn tại tại một thời điểm — cần gọi `quit()` để
     * đóng context hiện tại trước khi tạo mới.
     *
     * @param options - Override các tùy chọn context (viewport, locale...).
     * @returns `BrowserContext` của Playwright để tạo page và thao tác với trình duyệt.
     * @throws {Error} Nếu chưa gọi `launch()`.
     * @throws {Error} Nếu context đã tồn tại.
     *
     * @example
     * const context = await browser.newContext();
     * const page = await context.newPage();
     * await page.goto('https://example.com');
     */
    newContext(options?: Partial<PluginLaunchOptions>): Promise<BrowserContext>;
    /**
     * Đóng trình duyệt, giải phóng tài nguyên và lưu profile.
     *
     * Nếu đã gọi `useProfile()`, profile sẽ được lưu về đường dẫn đó.
     * Truyền `saveDataPath` để ghi đè đường dẫn lưu profile cho lần `quit()` này.
     * Gọi khi chưa `launch()` sẽ không làm gì.
     *
     * @param saveDataPath - Ghi đè đường dẫn lưu profile, ưu tiên hơn path trong `useProfile()`.
     *
     * @example
     * await browser.quit();                          // lưu về path đã dùng trong useProfile
     * await browser.quit('./profiles/user_backup');  // lưu về path khác
     */
    quit(saveDataPath?: string): Promise<void>;
}

declare const PACKAGE_PATH: string;

export { Chromium, type FetchOptions, type FingerprintOptions, type Launcher, PACKAGE_PATH, type PWChromium, type PluginLaunchOptions, type ProfileOptions, type ProxyOptions };
