import rfdc from "rfdc"
import defu from "defu"
import path from "path"
import fs from "fs-extra"
import { randomFloat, randomItem, randomUID, randomWebGL } from "./utils"
import { randomInt } from "crypto"
import { defaultPreferences, gologinConfig } from "./template"
import type { IOptions, IProfile, ISpawnArgs } from "./types"
import { deviceMemory, generateUserAgent, hwConcurrency, screens } from "./resources"

const clone = rfdc()

const defaultOptions: IOptions = {
  version: 134,
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
    const { username, password } = payload.proxy
    newGologinConfig.proxy.username = username
    newGologinConfig.proxy.password = password
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

  const webGl = randomWebGL()
  newGologinConfig.webGl = webGl
  newGologinConfig.webGl.mode = maskWebGLMetadata
  newGologinConfig.webGl.vendor = vendor
  newGologinConfig.webGl.renderer = renderer

  // webglmetadata
  newGologinConfig.webgl.metadata = webGl
  newGologinConfig.webgl.metadata.mode = maskWebGLMetadata
  newGologinConfig.webgl.metadata.vendor = vendor
  newGologinConfig.webgl.metadata.renderer = renderer

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

  // WebRTC
  newGologinConfig.webrtc.mode = options.webrtc.mode

  // Location
  newGologinConfig.geoLocation.mode = options.location.mode

  // mediaDevices
  newGologinConfig.mediaDevices.uid = randomUID()
  newGologinConfig.mediaDevices.audioInputs = randomInt(0, 3)
  newGologinConfig.mediaDevices.audioOutputs = randomInt(0, 3)
  newGologinConfig.mediaDevices.videoInputs = randomInt(0, 3)


  newGologinConfig.userAgent = generateUserAgent(options.version)
  newGologinConfig.navigator.platform = "Win32"


  const prefs = {
    ...clone(defaultPreferences),
    gologin: newGologinConfig,
  }

  return prefs
}

export const spawnArgs = (
  options: ISpawnArgs,
  payload: IProfile,
  args: string[] = []
) => {
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
    "--lang=en",
    "--font-masking-mode=2",
    "--password-store=basic",
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