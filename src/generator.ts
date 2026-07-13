import rfdc from "rfdc"
import defu from "defu"
import path from "path"
import fs from "fs-extra"
import { randomFloat, randomItem, randomUID, randomWebGL } from "./utils"
import { randomInt } from "crypto"
import { defaultPreferences, gologinConfig } from "./template"
import type { IOptions, IProfile, ISpawnArgs } from "./types"
import { deviceMemory, generateUserAgent, hwConcurrency, maxTouchPoints, platformNavigatorPlatform, platformVersion, screens } from "./resources"
import { webGpuArchitectures, webGpuVendorFamily } from "./webgl"

const clone = rfdc()

export const defaultOptions: IOptions = {
  version: 146,
  platform: "win",
  doNotTrack: true,
  dns: "",
  screen: null,
  webrtc: {
    mode: "alerted",
    fillBasedOnIP: true,
  },
  timezone: {
    fillBasedOnIP: true,
    id: "",
  },
  location: {
    mode: "prompt",
    fillBasedOnIP: true,
    latitude: 0,
    longitude: 0,
    accuracy: 100
  },
  language: {
    autoLang: true,
    value: "",
  },
  canvas: {
    mode: "noise"
  },
  clientRects: {
    mode: "noise"
  },
  audioContext: {
    mode: "noise"
  },
  mediaDevices: {
    mode: "noise"
  },
  webGL: {
    mode: "noise"
  },
  webGLMetadata: {
    mode: "mask",
    vendor: "",
    renderer: "",
  },
  fonts: {
    mode: "noise"
  },
}

export const getNewFingerprint = (payload: IProfile, opts: Partial<IOptions> = defaultOptions) => {
  const options = defu(opts, defaultOptions)
  const newGologinConfig = clone(gologinConfig)

  // name
  newGologinConfig.name = payload.name || randomUID(5)

  // Proxy
  if (payload.proxy.protocol) {
    const { protocol, host, port, username, password } = payload.proxy
    newGologinConfig.proxy.username = username
    newGologinConfig.proxy.password = password
    newGologinConfig.proxy.mode = "fixed_servers"
    newGologinConfig.proxy.schema = protocol
    newGologinConfig.proxy.server = `${host}:${port}`
    // Timezone
    if (payload.proxyInfo) {
      newGologinConfig.timezone.id = payload.proxyInfo.timezone
      newGologinConfig.geoLocation.latitude = parseFloat(payload.proxyInfo.latitude)
      newGologinConfig.geoLocation.longitude = parseFloat(payload.proxyInfo.longitude)
    }
  }

  // audio
  const audioNoiseValue = parseFloat(
    (randomFloat(1, 9) / 100000000).toExponential(12),
  )
  newGologinConfig.audioContext.noiseValue = audioNoiseValue
  newGologinConfig.audioContext.enable = options.audioContext.mode === "noise"

  // canvas
  const canvasNoise = parseFloat(Math.random().toFixed(8))
  newGologinConfig.canvasMode = options.canvas.mode
  newGologinConfig.canvasNoise = canvasNoise

  // clientRects
  const clientRectsNoise = parseFloat(randomFloat(1, 9).toFixed(4))
  newGologinConfig.getClientRectsNoice =
    newGologinConfig.get_client_rects_noise = clientRectsNoise
  newGologinConfig.client_rects_noise_enable =
    options.clientRects.mode === "noise"

  // webGL
  const maskWebGLMetadata = options.webGLMetadata.mode === "mask"
  const { vendor, renderer } = options.webGLMetadata

  const webGl = randomWebGL(options.platform)
  newGologinConfig.webGl = webGl
  newGologinConfig.webGl.mode = maskWebGLMetadata
  if (vendor) newGologinConfig.webGl.vendor = vendor
  if (renderer) newGologinConfig.webGl.renderer = renderer

  // webglmetadata
  newGologinConfig.webgl.metadata = webGl
  newGologinConfig.webgl.metadata.mode = maskWebGLMetadata
  if (vendor) newGologinConfig.webgl.metadata.vendor = vendor
  if (renderer) newGologinConfig.webgl.metadata.renderer = renderer

  // is_m1 (Apple Silicon) only applies to mac profiles whose picked GPU is an Apple Mx chip
  newGologinConfig.is_m1 = options.platform === "mac" && /Apple M\d/.test(newGologinConfig.webGl.renderer)

  // webGPU adapter info follows the same GPU vendor family as the WebGL pick, so the two
  // fingerprints stay consistent with each other
  const webGpuFamily = webGpuVendorFamily(newGologinConfig.webGl.vendor)
  newGologinConfig.webGpu.supportedAdapters.highPerformance.info.vendor = webGpuFamily
  newGologinConfig.webGpu.supportedAdapters.highPerformance.info.architecture = randomItem(
    webGpuArchitectures[webGpuFamily]
  )

  const webGlNoise = parseFloat(randomFloat(1, 99).toFixed(3))
  newGologinConfig.webglNoiseValue = newGologinConfig.webgl_noise_value =
    webGlNoise
  const webGLNoiseImage = options.webGL.mode === "noise"
  newGologinConfig.webgl_noice_enable =
    newGologinConfig.webglNoiceEnable =
    newGologinConfig.webgl_noise_enable =
    webGLNoiseImage

  // deviceMemory
  newGologinConfig.deviceMemory = randomItem(deviceMemory) * 1024

  // hardwareConcurrency
  newGologinConfig.hardwareConcurrency = randomItem(hwConcurrency)

  // Do not track
  newGologinConfig.doNotTrack = options.doNotTrack

  // DNS
  newGologinConfig.dns = options.dns

  // screen
  const [width, height] = options.screen ? options.screen.split('x') : randomItem(screens).split("x")
  newGologinConfig.screenWidth = parseInt(width, 10)
  newGologinConfig.screenHeight = parseInt(height, 10)
  newGologinConfig.mobile.width = newGologinConfig.screenWidth
  newGologinConfig.mobile.height = newGologinConfig.screenHeight

  // WebRTC
  newGologinConfig.webrtc.mode = options.webrtc.mode
  newGologinConfig.webrtc.should_fill_empty_ice_list = options.webrtc.fillBasedOnIP
  newGologinConfig.webRTC = {
    ...newGologinConfig.webRTC,
    mode: options.webrtc.mode,
    fillBasedOnIp: options.webrtc.fillBasedOnIP,
    isEmptyIceList: options.webrtc.fillBasedOnIP,
  }

  // language
  if (options.language.value) {
    const primary = options.language.value
    const base = primary.split("-")[0]
    newGologinConfig.languages = `${primary},${base},en-US,en`
    newGologinConfig.langHeader = `${primary};q=0.9,${base};q=0.8,en-US;q=0.7,en;q=0.6`
  }

  // Location
  newGologinConfig.geoLocation.mode = options.location.mode

  // mediaDevices
  newGologinConfig.mediaDevices.uid = randomUID()
  newGologinConfig.mediaDevices.audioInputs = randomInt(0, 3)
  newGologinConfig.mediaDevices.audioOutputs = randomInt(0, 3)
  newGologinConfig.mediaDevices.videoInputs = randomInt(0, 3)


  newGologinConfig.userAgent = generateUserAgent(options.version, options.platform)
  newGologinConfig.navigator.platform = platformNavigatorPlatform[options.platform]
  newGologinConfig.navigator.max_touch_points = randomItem(maxTouchPoints)
  newGologinConfig.platform_version = platformVersion[options.platform]


  const prefs = {
    ...clone(defaultPreferences),
    gologin: newGologinConfig,
  }

  // Chrome's own top-level proxy pref, mirroring what the --proxy-server CLI flag sets up,
  // observed in a real GoLogin-launched Preferences file alongside the gologin.proxy block
  if (payload.proxy.protocol) {
    const { protocol, host, port, username, password } = payload.proxy
    prefs.proxy = {
      mode: "fixed_servers",
      server: `${protocol}://${username}:${password}@${host}:${port}`,
    }
  }

  return prefs
}

// Chromium's --webrtc-ip-handling-policy values, as observed in a real GoLogin-launched
// Orbita 149 command line (which used "default_public_interface_only" for the "alerted" mode).
const webrtcIpHandlingPolicy: Record<IOptions["webrtc"]["mode"], string> = {
  real: "default",
  alerted: "default_public_interface_only",
  disabled: "disable_non_proxied_udp",
}

export const spawnArgs = (
  options: ISpawnArgs,
  payload: IProfile,
  fingerprint: Partial<IOptions> = {},
  args: string[] = []
) => {
  const { webrtc, fonts, language } = defu(fingerprint, defaultOptions)
  let params: string[] = []
  const { userDataDir, remoteDebuggingPort } = options
  const { proxy, proxyInfo } = payload

  if (proxy.protocol) {
    let proxyStr = `${proxy.protocol}://${proxy.host}:${proxy.port}`
    const hr_rules = `MAP * 0.0.0.0 , EXCLUDE ${proxy.host}`
    params.push(`--tz=${proxyInfo?.timezone}`)
    params.push(`--proxy-server=${proxyStr}`)
    params.push(`--host-resolver-rules=${hr_rules}`)
  }

  params = [
    `--user-data-dir=${userDataDir}`,
    ...(remoteDebuggingPort ? [`--remote-debugging-port=${remoteDebuggingPort}`] : []),
    `--lang=${language.value || "en-US"}`,
    `--font-masking-mode=${fonts.mode === "off" ? 0 : 1}`,
    `--webrtc-ip-handling-policy=${webrtcIpHandlingPolicy[webrtc.mode]}`,
    "--password-store=basic",
    "--disable-encryption",
    ...params,
    ...args
  ]

  return params
}

export const writePrefs = async (userDataDir: string, prefs: any) => {
  const prefsPath = path.join(userDataDir, "Default", "Preferences")
  await fs.ensureFile(prefsPath)
  await fs.writeJSON(prefsPath, prefs)
}