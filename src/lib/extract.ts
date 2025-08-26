import type { Swatch } from '../types'
import { kMeansLab } from './colors'

export function extractColorsFromImage(img: HTMLImageElement, k: number, reuseCanvas?: HTMLCanvasElement): Swatch[] {
  const canvas = reuseCanvas ?? document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const max = 220
  const scale = Math.min(max / img.width, max / img.height)
  canvas.width = Math.max(1, Math.floor(img.width * scale))
  canvas.height = Math.max(1, Math.floor(img.height * scale))
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const pixels: [number, number, number][] = []
  for (let i = 0; i < data.length; i += 16) {
    const a = data[i + 3]; if (a >= 128) pixels.push([data[i], data[i + 1], data[i + 2]])
  }
  return kMeansLab(pixels, k)
}

