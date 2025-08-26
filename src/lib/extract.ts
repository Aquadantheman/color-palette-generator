import type { Swatch } from '../types'
import { kMeansLab } from './colors'

export function extractColorsFromImage(img: HTMLImageElement, k: number, reuseCanvas?: HTMLCanvasElement): Swatch[] {
  const canvas = reuseCanvas ?? document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  
  // Use larger size for better color sampling
  const max = 300 // Increased from 220
  const scale = Math.min(max / img.width, max / img.height)
  canvas.width = Math.max(1, Math.floor(img.width * scale))
  canvas.height = Math.max(1, Math.floor(img.height * scale))
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const pixels: [number, number, number][] = []
  
  // Sample more pixels and filter better
  for (let i = 0; i < data.length; i += 8) { // Sample every 2 pixels instead of every 4
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    // Better filtering: include opaque pixels that aren't too extreme
    if (a >= 200) { // Must be mostly opaque
      const brightness = r + g + b
      // Exclude very dark (< 30) and very light (> 720) pixels
      if (brightness > 30 && brightness < 720) {
        pixels.push([r, g, b])
      }
    }
  }
  
  console.log(`Sampled ${pixels.length} pixels for k-means clustering`)
  
  // If we don't have enough pixels, fall back to simple sampling
  if (pixels.length < k * 10) {
    console.log('Not enough pixels for k-means, using simple sampling')
    const colors: Swatch[] = []
    const seen = new Set<string>()
    
    for (const [r, g, b] of pixels) {
      const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
      if (!seen.has(hex)) {
        seen.add(hex)
        colors.push({ rgb: [r, g, b], hex })
        if (colors.length >= k) break
      }
    }
    
    return colors
  }
  
  return kMeansLab(pixels, k)
}
