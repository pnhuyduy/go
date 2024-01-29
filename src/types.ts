import { ICheckProxyResult, IProxy } from "./proxy"

export type Nullable<T> = T | null

type TMode = "noise" | "off"

export interface IOptions {
  version: string
  doNotTrack: boolean
  dns: string
  screen: Nullable<string>
  webrtc: {
    mode: "alerted" | "disabled" | "real"
    fillBasedOnIP: boolean
  }
  timezone: {
    fillBasedOnIP: boolean
    id: string
  }
  location: {
    mode: "prompt" | "allow" | "block"
  }
  language: {
    autoLang: boolean
    value: string
  }
  canvas: {
    mode: TMode
  }
  clientRects: {
    mode: TMode
  }
  audioContext: {
    mode: TMode
  }
  mediaDevices: {
    mode: TMode
  }
  webGL: {
    mode: TMode
  }
  webGLMetadata: {
    mode: "mask" | "off"
    vendor: string
    renderer: string
  }
  fonts: {
    mode: TMode
  }
}

export interface IProfile {
  name?: string
  proxy: IProxy
  proxyInfo?: Nullable<ICheckProxyResult>
}

export interface ISpawnArgs {
  userDataDir: string
  remoteDebuggingPort?: number
}