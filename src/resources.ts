import type { TPlatform } from "./types"
import { randomInt } from "./utils"

export const screens = ['800x600', '960x720', '1024x576', '1024x600', '1024x640', '1024x768', '1152x648', '1152x864', '1280x720', '1280x768', '1280x800', '1280x960', '1280x1024', '1360x768', '1366x768', '1400x1050', '1440x900', '1440x1080', '1536x864', '1600x900', '1600x1200', '1680x1050', '1856x1392', '1920x1080', '1920x1200', '1920x1440', '2048x1152', '2048x1536', '2304x1440', '2560x1440', '2560x1600', '2560x2048', '2880x1800']
export const hwConcurrency = [2, 4, 8, 16, 32]
export const deviceMemory = [2, 4, 8, 16, 32, 64]

export const platformUAStrings: Record<TPlatform, string> = {
  win: "Windows NT 10.0; Win64; x64",
  mac: "Macintosh; Intel Mac OS X 10_15_7",
  linux: "X11; Linux x86_64",
}

export const platformNavigatorPlatform: Record<TPlatform, string> = {
  win: "Win32",
  mac: "MacIntel",
  linux: "Linux x86_64",
}

// Chrome build numbers climb roughly linearly with the major version. Anchoring the
// formula on a known real data point (134 -> 6998) keeps arbitrary major versions
// plausible without having to hand-maintain a full version lookup table.
const CHROME_BUILD_ANCHOR = { version: 134, build: 6998 }
const CHROME_BUILD_STEP_PER_VERSION = 62

export const generateChromeBuildNumber = (version: number) => {
  const delta = version - CHROME_BUILD_ANCHOR.version
  return Math.max(1000, Math.round(CHROME_BUILD_ANCHOR.build + delta * CHROME_BUILD_STEP_PER_VERSION))
}

export const generateUserAgent = (version: number, platform: TPlatform = "win") => {
  const build = generateChromeBuildNumber(version)
  const patch = randomInt(0, 150)
  return `Mozilla/5.0 (${platformUAStrings[platform]}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.${build}.${patch} Safari/537.36`
}