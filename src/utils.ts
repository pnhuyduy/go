import crypto from "crypto"
import { webglVendors } from "./webgl"
import type { TPlatform } from "./types"

export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min)
}

export const randomFloat = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

export const randomUID = (length = 30) => {
  const uid = crypto.randomBytes(length).toString("hex")
  return uid
}

export const randomItem = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)]

export const randomWebGL = (platform: TPlatform = "win") => {
  const vendor = randomItem(webglVendors[platform])
  const renderer = randomItem(vendor.renderer)

  return {
    mode: true,
    renderer: renderer.value,
    vendor: vendor.value,
  }
}