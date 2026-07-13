# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`gologin` (package name in package.json) is a small TypeScript library that generates browser fingerprint
configs and launch arguments for the GoLogin/Orbita anti-detect Chromium browser. Given a proxy and a
fingerprint options object, it produces a Chrome `Preferences` JSON file (with a `gologin` fingerprint block)
and the CLI args needed to spawn the Orbita browser with a matching proxy/user-data-dir setup.

## Commands

- `pnpm build` — bundle `src/index.ts` to `dist/` (cjs + esm + `.d.ts`) via tsup.
- `pnpm dev` — same as build, in watch mode.
- `pnpm test` — **not a unit test suite.** It runs `tsup test/index.ts --watch --onSuccess "node dist/index.js"`,
  which bundles [test/index.ts](test/index.ts) to `dist/index.js` and executes it on every save. That script
  spawns a real local Orbita browser binary at a hardcoded path
  (`C:/Users/Admin/.gologin/browser/orbita-browser-146/chrome.exe`) and a hardcoded local proxy
  (`127.0.0.1:22338`). It only works on a machine with GoLogin's Orbita browser installed at that path — treat
  it as a manual smoke-test script, not CI-safe automated tests. Update the `executablePath`/`proxyStr`
  constants at the top of the file for your machine before running it.
- There is no lint script and no test framework (no jest/vitest) configured.
- Package manager is pnpm (`pnpm-lock.yaml` is present).

## Architecture

The library composes fingerprint data from a few layers:

1. **[src/template.ts](src/template.ts)** — two large static objects: `gologinConfig` (the base shape of the
   `gologin` fingerprint block, with placeholder/default values, including `webGpu` and `webRTC` — see below)
   and `defaultPreferences` (the full Chrome `Preferences` file template). `defaultPreferences` only holds a
   placeholder `"proxy": {}` key (kept so `getNewFingerprint` can assign a typed top-level `proxy` pref onto
   it) — it does **not** embed a duplicate `gologin` block, since `getNewFingerprint` always overwrites
   `gologin` wholesale with the generated config anyway; keeping a second copy in sync there would just be a
   drift risk with no effect on output.
2. **[src/resources.ts](src/resources.ts)** and **[src/webgl.ts](src/webgl.ts)** — pools of realistic random
   values to pick from, most of them keyed by `TPlatform` (`"win" | "mac" | "linux"`, see
   [src/types.ts](src/types.ts)):
   - `resources.ts` exports `platformUAStrings`/`platformNavigatorPlatform` (the OS token used in the UA string
     and `navigator.platform`, per platform) and `generateUserAgent(version, platform)`. There is no
     per-version lookup table to maintain: `generateChromeBuildNumber(version)` derives a plausible Chrome
     build number by extrapolating linearly from one real anchor point (`146` → `6998`), so any arbitrary
     major version number (past or future) produces a structurally realistic, unique UA on every call. Screen
     resolutions/hardware concurrency/device memory pools are platform-agnostic.
   - `webgl.ts` exports `webglVendors: Record<TPlatform, IWebGLVendor[]>` — curated vendor/renderer pairs per
     OS (Windows ANGLE/Direct3D11 strings, macOS ANGLE/Metal strings, Linux ANGLE/Mesa strings). Keeping this
     platform-keyed matters: a Mac UA paired with a Windows Direct3D11 renderer string is an inconsistent,
     easily-detectable fingerprint, so adding a new platform means adding a vendor list here, not just a UA
     string. It also exports `webGpuVendorFamily(webglVendor)` (maps a WebGL vendor string like
     `"Google Inc. (Intel)"` to a lowercase family tag: `intel`/`nvidia`/`amd`/`apple`/`unknown`) and
     `webGpuArchitectures` (a family → architecture-codename pool), used to keep `gologin.webGpu`'s adapter
     `vendor`/`architecture` consistent with whichever WebGL vendor was randomly picked. Only the Intel
     `gen-12lp` architecture value is independently verified (from a real capture); the rest of the pool is a
     plausible inference — see the Orbita compatibility note below.
3. **[src/utils.ts](src/utils.ts)** — small randomization helpers (`randomInt`, `randomFloat`, `randomUID`,
   `randomItem`, `randomWebGL(platform)`) built on top of the pools above. `randomWebGL` picks from
   `webglVendors[platform]` (defaults to `"win"`).
4. **[src/generator.ts](src/generator.ts)** — the core logic:
   - `getNewFingerprint(payload, opts)` deep-clones `gologinConfig` (via `rfdc`) and `defu`-merges `opts` over
     `defaultOptions` (`{ version: 146, platform: "win", ... }`), then fills in every fingerprint field
     (audio/canvas/clientRects noise, WebGL vendor/renderer + noise, screen size, device memory, hardware
     concurrency, user agent, proxy credentials, timezone/geolocation from `payload.proxyInfo`, media devices,
     etc.). `options.version`/`options.platform` drive `generateUserAgent`, `randomWebGL`, and
     `navigator.platform` together, so a profile's UA, WebGL renderer, and OS token always stay consistent
     with each other. `options.webGLMetadata.vendor`/`.renderer` only override the platform-random pick when
     explicitly set to a non-empty string — leave them `""` (the default) to let the random per-platform pick
     stand. Note several fields are written under multiple legacy/duplicate key names (e.g.
     `webgl_noise_value` / `webglNoiseValue`, `getClientRectsNoice` / `get_client_rects_noise`) — this mirrors
     what the Orbita browser's prefs schema actually expects, so don't "clean up" the duplication without
     checking Orbita compatibility. Also derived from the platform/WebGL pick: `navigator.max_touch_points`
     (random from `resources.maxTouchPoints`), `platform_version` (per-platform constant from
     `resources.platformVersion` — Chromium's Sec-CH-UA-Platform-Version client hint), `is_m1` (true only when
     `platform === "mac"` and the picked WebGL renderer is an Apple M-series chip, via regex on the renderer
     string), `mobile.width`/`mobile.height` (kept equal to `screenWidth`/`screenHeight` — a real profile's
     `mobile` block always matches its screen size, and a prior version of this library left them
     inconsistently hardcoded at 1280x720), and `webGpu.supportedAdapters.highPerformance.info.vendor`/
     `.architecture` (via `webGpuVendorFamily`/`webGpuArchitectures`, kept consistent with the WebGL vendor).
     `gologin.proxy` also gets `mode`/`schema`/`server` fields (not just `username`/`password`) when a proxy
     is set, and a real Chromium top-level `proxy` pref (`{mode: "fixed_servers", server: "scheme://user:pass@host:port"}`)
     is added onto the returned `Preferences` object outside of `gologin` — this is the pref Chrome itself
     reads, separate from the `--proxy-server` CLI flag `spawnArgs` also sets. Returns the full
     `defaultPreferences` clone with `gologin` set to the generated config.
   - `spawnArgs(options, payload, fingerprint, args)` builds the Chromium CLI argument list (`--user-data-dir`,
     `--proxy-server`, `--host-resolver-rules`, `--tz`, `--font-masking-mode`, `--webrtc-ip-handling-policy`,
     `--lang`, etc.) needed to launch the browser with the given profile. Pass the same (or a subset of the)
     `IOptions` used for `getNewFingerprint` as `fingerprint` so the CLI flags stay consistent with what was
     written to `Preferences` — `webrtc.mode`/`fonts.mode`/`language.value` all only take effect through these
     CLI flags, not through the `gologin` Preferences block (see the Orbita compatibility note below).
   - `writePrefs(userDataDir, prefs)` writes the generated prefs JSON to
     `<userDataDir>/Default/Preferences`, which is the on-disk location Chromium reads on startup.
5. **[src/proxy.ts](src/proxy.ts)** — `checkProxy(proxy)` resolves proxy geolocation/timezone by querying a
   list of `PROXY_SERVICES` (currently `ipfoxy` and GoLogin's own `time.gologin.com`) through the proxy itself
   (via `https-proxy-agent`/`socks-proxy-agent`), trying each service in order until one returns a valid
   result. This is the source of the `proxyInfo` passed into `getNewFingerprint`/`spawnArgs` for
   timezone/geolocation consistency with the proxy's IP.
6. **[src/types.ts](src/types.ts)** — shared types (`IOptions` fingerprint options, `IProfile`,
   `ISpawnArgs`). `tsconfig.json`'s `include` only lists `src/types.ts`, so `tsc` in this repo only
   type-checks that file directly — actual build-time type checking/bundling is done by tsup/esbuild via
   `tsup.config.ts`, and full `.d.ts` generation only happens on production builds (`dts: IS_PROD` in
   [tsup.config.ts](tsup.config.ts)).

Everything is re-exported from **[src/index.ts](src/index.ts)**, the package's single entry point.

### Orbita version compatibility (verified against real Orbita 146/146/149 profiles)

- **Correction to an earlier note:** a prior version of this doc claimed a real v149 profile's `gologin` key
  only contained `{ profile_id, userId, userPlanName }`, with none of the canvas/webGL/audio/clientRects/webrtc
  fields present — and concluded those fields might not take effect on recent Orbita builds. **A real
  GoLogin-launched Orbita 146 profile contradicts this**: its `gologin` block has the full
  canvas/webGL/audio/clientRects/webrtc fingerprint (plus more — see below), so the v149 sample was likely
  atypical (e.g. a profile GoLogin hadn't fully synced/launched), not evidence of a general "recent builds
  drop local fingerprinting" trend. Treat the fingerprint fields as expected to take effect on current Orbita
  builds unless a specific version is shown otherwise.
- **Fields confirmed present in a real v146 `gologin` block that this library didn't generate before** (now
  added, see `getNewFingerprint` above): `platform_version`, `is_m1` (properly derived, not just always
  `false`), `navigator.max_touch_points` (was always `0`), `mobile.width`/`mobile.height` (was hardcoded,
  now synced to `screenWidth`/`screenHeight`), `proxy.mode`/`proxy.schema`/`proxy.server` (was
  username/password only), a top-level (non-`gologin`) Chromium `proxy` pref, a **`webRTC`** object (capital
  RTC — distinct from the existing lowercase `webrtc`, with extra fields: `customize`, `enabled`,
  `fillBasedOnIp`, `isEmptyIceList`, `localIpMasking`, `localIps`, `publicIp`), and a **`webGpu`** object
  describing WebGPU adapter capabilities/limits/texture-format support. `userId`/`userPlanName` were also seen
  in the real block but are deliberately **not** generated — they identify the GoLogin *account* that owns the
  profile, not the browser fingerprint, and this library has no concept of a GoLogin account/auth.
- **`webglParams.glParamValues` in the real v146 sample only overrides `RENDERER`/`VENDOR`** (2 entries), not
  the ~40-entry list of spoofed GL parameter values (`MAX_TEXTURE_SIZE`, `ALIASED_LINE_WIDTH_RANGE`, etc.) this
  library used to generate. This matches how `UNMASKED_RENDERER_WEBGL`/`UNMASKED_VENDOR_WEBGL` spoofing
  typically works — only the vendor-identifying strings are faked, other `getParameter()` results pass through
  from the real GPU untouched. `webglParams.extensions` was also updated to the fuller v146 extension list
  (added `EXT_clip_control`, `EXT_conservative_depth`, `WEBGL_stencil_texturing`, etc.) — this list is tied to
  the Chrome/Orbita build, so it may need re-verifying against future major versions.
- **`--webrtc-ip-handling-policy`, `--font-masking-mode`, and `--lang` are real, effective Chromium CLI flags**
  observed in a genuine GoLogin v149 launch command, independent of the Preferences file. `spawnArgs` derives
  these from `IOptions.webrtc.mode` / `.fonts.mode` / `.language.value`. The `webrtc.mode` → policy mapping
  (`real`→`default`, `alerted`→`default_public_interface_only`, `disabled`→`disable_non_proxied_udp`) is
  confirmed for `alerted` only (the one value seen in the wild); `real`/`disabled` are reasonable inferences,
  not independently verified.
- **`webGpu` adapter `vendor`/`architecture` values are only independently verified for one data point**
  (Intel, `gen-12lp`, from the v146 capture). The `nvidia`/`amd`/`apple` architecture pools in
  `webgl.ts`'s `webGpuArchitectures` are plausible codenames inferred from public WebGPU adapter-info
  documentation, not confirmed against real captures — re-verify if precise WebGPU fingerprint matching
  matters for a given use case.

### Multi-platform / multi-version support

`IOptions.platform: TPlatform` (`"win" | "mac" | "linux"`, default `"win"`) was added so a single
`getNewFingerprint` call can target any of the three desktop OSes without producing a mismatched fingerprint.
`IOptions.version` accepts any Chrome major version number — there's no per-version data to add for new Chrome
releases, since the UA build number is generated algorithmically. This did remove the previously-unused,
inaccurate `userAgents` static map and the default `webgl.ts` export (now `webglVendors`); anything importing
those directly from a prior version of this package needs to update. `is_m1`, `platform_version`, and the
`webGpu` adapter vendor/architecture are all derived automatically from `options.platform` and the WebGL
vendor picked for that platform — there's no separate `IOptions` field for them, since they're implied by
`platform` + the random WebGL pick rather than independently configurable.

### Typical flow (see [test/index.ts](test/index.ts) for a worked example)

1. Build an `IProxy` and optionally call `checkProxy` to get `ICheckProxyResult` (`proxyInfo`).
2. Call `getNewFingerprint({ proxy, proxyInfo, name }, options)` to get the `Preferences` JSON.
3. `writePrefs(userDataDir, prefs)` to persist it, then `spawnArgs({ userDataDir, remoteDebuggingPort }, profile)`
   to get CLI args, and `child_process.spawn` the Orbita executable with those args.
