# gologout

Thư viện TypeScript nhỏ dùng để sinh cấu hình fingerprint (Chrome `Preferences`) và tham số dòng lệnh (CLI args)
để khởi chạy trình duyệt chống phát hiện GoLogin/Orbita (Chromium fork), dựa trên một proxy và một object tuỳ
chọn fingerprint.

## Cài đặt

```bash
pnpm add gologout
```

## Import

```ts
import {
  getNewFingerprint,
  spawnArgs,
  writePrefs,
  checkProxy,
  defaultOptions,
} from 'gologout'
import type { IOptions, IProfile, ISpawnArgs, IProxy } from 'gologout'
```

## Luồng sử dụng cơ bản

Xem ví dụ đầy đủ tại [test/index.ts](test/index.ts). Về cơ bản có 4 bước:

1. Tạo `IProxy` và (tuỳ chọn) gọi `checkProxy` để lấy `proxyInfo` (timezone/geolocation theo IP thật của proxy).
2. Gọi `getNewFingerprint(profile, options)` để sinh nội dung file `Preferences`.
3. Gọi `writePrefs(userDataDir, prefs)` để ghi file đó ra đĩa.
4. Gọi `spawnArgs(...)` để lấy CLI args, rồi `child_process.spawn` file thực thi Orbita với các args đó.

```ts
import { spawn } from 'child_process'
import { checkProxy, getNewFingerprint, spawnArgs, writePrefs } from 'gologout'
import type { IProfile } from 'gologout'
import fs from 'fs-extra'
import path from 'path'

const executablePath = 'C:/Users/Admin/.gologin/browser/orbita-browser-146/chrome.exe'
const userDataDir = path.join(path.resolve(), 'profiles', 'my-profile')

const run = async () => {
  const profile: IProfile = {
    name: 'my-profile',
    proxy: {
      protocol: 'http', // hoặc 'socks', hoặc null nếu không dùng proxy
      host: '103.179.189.46',
      port: 14545,
      username: 'user',
      password: 'pass',
    },
  }

  // Chỉ cần checkProxy khi có protocol (mới dò được IP/timezone thật qua proxy)
  if (profile.proxy.protocol) {
    profile.proxyInfo = await checkProxy(profile.proxy)
  }

  // Có thể truyền options tuỳ chỉnh (partial), phần còn thiếu sẽ lấy từ defaultOptions
  const fingerprint = getNewFingerprint(profile, {
    version: 146,
    platform: 'win', // 'win' | 'mac' | 'linux'
  })

  await fs.ensureDir(userDataDir)
  await writePrefs(userDataDir, fingerprint)

  const args = spawnArgs(
    { userDataDir, remoteDebuggingPort: 1234 },
    profile,
    { version: 146, platform: 'win' }, // cùng options đã dùng ở getNewFingerprint
  )

  const child = spawn(executablePath, args)
  console.log('child pid', child.pid)
}

run()
```

## API

### `getNewFingerprint(payload: IProfile, opts?: Partial<IOptions>): object`

Sinh toàn bộ nội dung file Chrome `Preferences` (bao gồm block `gologin` chứa fingerprint).

- `payload: IProfile`
  - `name?: string` — tên profile, mặc định là chuỗi hex ngẫu nhiên nếu bỏ trống.
  - `proxy: IProxy` — thông tin proxy (bắt buộc; đặt `protocol: null` nếu không dùng proxy).
  - `proxyInfo?: ICheckProxyResult | null` — kết quả từ `checkProxy`, dùng để set timezone/geolocation khớp
    với IP thật của proxy. Chỉ áp dụng khi `proxy.protocol` khác `null`.
- `opts: Partial<IOptions>` — merge đè lên `defaultOptions` (xem bảng field bên dưới). Truyền phần nào cần đổi,
  phần còn lại giữ mặc định.
- Trả về object JSON sẵn sàng ghi ra file `Preferences` (dùng với `writePrefs`).

**Lưu ý quan trọng (đã kiểm chứng với profile Orbita 149 thật):** trên các bản Orbita gần đây, phần
canvas/webGL/audio/clientRects/webrtc trong block `gologin` **có thể không còn có tác dụng** — GoLogin client
thật dường như không còn điều khiển các phần này qua file `Preferences` cục bộ ở v149 nữa. Chỉ xác nhận hoạt
động tốt trên Orbita 146. Nên tự kiểm tra lại bằng trang test fingerprint thật nếu quan trọng.

### `spawnArgs(options: ISpawnArgs, payload: IProfile, fingerprint?: Partial<IOptions>, args?: string[]): string[]`

Sinh danh sách CLI args để khởi chạy Orbita.

- `options.userDataDir: string` — thư mục user-data-dir của Chromium.
- `options.remoteDebuggingPort?: number` — nếu có, thêm `--remote-debugging-port`.
- `payload: IProfile` — cùng object dùng cho `getNewFingerprint` (đọc `proxy`/`proxyInfo` để set
  `--proxy-server`, `--host-resolver-rules`, `--tz`).
- `fingerprint?: Partial<IOptions>` — **nên truyền cùng options** đã dùng khi gọi `getNewFingerprint`, vì
  `webrtc.mode`, `fonts.mode`, `language.value` chỉ có hiệu lực qua các cờ CLI này (`--webrtc-ip-handling-policy`,
  `--font-masking-mode`, `--lang`), không qua file `Preferences`.
- `args?: string[]` — các args bổ sung tuỳ ý, được nối vào cuối danh sách.

Trả về `string[]` args để truyền cho `child_process.spawn(executablePath, args)`.

### `writePrefs(userDataDir: string, prefs: any): Promise<void>`

Ghi `prefs` (kết quả của `getNewFingerprint`) ra `<userDataDir>/Default/Preferences` — vị trí Chromium đọc khi
khởi động. Tự tạo file/thư mục nếu chưa tồn tại.

### `checkProxy(proxy: IProxy, timeout = 5000): Promise<ICheckProxyResult | null>`

Truy vấn geolocation/timezone của proxy bằng cách gọi ra ngoài **qua chính proxy đó** (dùng
`https-proxy-agent`/`socks-proxy-agent`). Thử lần lượt các service trong `PROXY_SERVICES` (`ipfoxy`, sau đó
`time.gologin.com`) cho đến khi có kết quả hợp lệ. Trả về `null` nếu tất cả service đều thất bại/timeout.

Kết quả `ICheckProxyResult`: `{ ip, country, timezone, latitude, longitude, accuracy }` — dùng làm
`payload.proxyInfo` cho `getNewFingerprint`/`spawnArgs`.

### Các hàm/pool tiện ích khác

- `generateUserAgent(version: number, platform: TPlatform): string` — sinh UA hợp lệ cho **bất kỳ** major
  version Chrome nào (không cần bảng tra cứu — build number được suy ra tuyến tính từ mốc `146` → `6998`).
- `randomWebGL(platform: TPlatform = 'win')` — chọn ngẫu nhiên một cặp vendor/renderer WebGL hợp lý cho đúng
  OS (tránh lỗi UA Mac đi kèm renderer Direct3D của Windows).
- `randomInt`, `randomFloat`, `randomUID`, `randomItem` — helper random dùng nội bộ, có thể tái sử dụng.
- `platformUAStrings`, `platformNavigatorPlatform`, `webglVendors`, `screens`, `deviceMemory`, `hwConcurrency`
  — các pool dữ liệu thô, phân loại theo `TPlatform`, nếu cần tự custom logic sinh fingerprint.

## Kiểu dữ liệu chính (`IOptions`)

Truyền `Partial<IOptions>` cho `getNewFingerprint`/`spawnArgs`; các field bỏ trống sẽ lấy từ `defaultOptions`
([src/generator.ts](src/generator.ts)):

| Field | Kiểu | Mặc định | Ghi chú |
|---|---|---|---|
| `version` | `number` | `146` | Major version Chrome, dùng để sinh UA + build number. |
| `platform` | `"win" \| "mac" \| "linux"` | `"win"` | Quyết định UA, `navigator.platform`, vendor WebGL đi cùng nhau. |
| `doNotTrack` | `boolean` | `true` | |
| `dns` | `string` | `""` | |
| `screen` | `string \| null` | `null` | Định dạng `"1920x1080"`; `null` = chọn ngẫu nhiên từ pool. |
| `webrtc.mode` | `"real" \| "alerted" \| "disabled"` | `"alerted"` | Chỉ có hiệu lực qua `spawnArgs` (`--webrtc-ip-handling-policy`). |
| `timezone.id` | `string` | `""` | Bị ghi đè bởi `payload.proxyInfo.timezone` nếu có. |
| `location.mode` | `"prompt" \| "allow" \| "block"` | `"prompt"` | |
| `language.value` | `string` | `""` | Chỉ có hiệu lực qua `spawnArgs` (`--lang`). |
| `canvas.mode` / `clientRects.mode` / `audioContext.mode` / `mediaDevices.mode` / `webGL.mode` / `fonts.mode` | `"noise" \| "off"` | `"noise"` | Xem lưu ý về Orbita 149 ở trên — có thể không còn tác dụng trên bản Orbita mới. |
| `webGLMetadata.vendor` / `.renderer` | `string` | `""` | Chỉ ghi đè pick ngẫu nhiên theo platform khi khác rỗng. |

## Build & test

- `pnpm build` — build `src/index.ts` ra `dist/` (cjs + esm + `.d.ts`) bằng tsup.
- `pnpm dev` — build ở chế độ watch.
- `pnpm test` — **không phải unit test.** Chạy [test/index.ts](test/index.ts), spawn thật một trình duyệt
  Orbita cục bộ tại đường dẫn hardcode và một proxy cục bộ hardcode. Cần sửa `executablePath`/`proxyStr` ở đầu
  file cho đúng máy bạn trước khi chạy, và cần máy đã cài GoLogin Orbita.
