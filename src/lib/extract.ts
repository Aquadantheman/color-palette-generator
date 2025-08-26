import type { Swatch } from '../types'

function rgbToHex(r: number, g: number, b: number) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h = Math.round((h < 0 ? h + 6 : h) * 60)
  const s = max === 0 ? 0 : d / max
  const v = max
  return [h, s, v]
}

export function extractColorsFromImage(img: HTMLImageElement, k: number): Swatch[] {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  
  // Scale image for processing
  const maxSize = 200
  const scale = Math.min(maxSize / img.width, maxSize / img.height)
  canvas.width = Math.max(1, Math.floor(img.width * scale))
  canvas.height = Math.max(1, Math.floor(img.height * scale))
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const colorMap = new Map<string, { count: number, rgb: [number, number, number] }>()
  
  // Sample pixels and count frequency
  for (let i = 0; i < data.length; i += 16) { // Every 4th pixel
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    // Filter for good colors
    if (a >= 200) {
      const brightness = r + g + b
      if (brightness > 30 && brightness < 720) {
        // Reduce color precision to group similar colors
        const rr = Math.floor(r / 8) * 8
        const gg = Math.floor(g / 8) * 8
        const bb = Math.floor(b / 8) * 8
        const key = `${rr},${gg},${bb}`
        
        if (colorMap.has(key)) {
          colorMap.get(key)!.count++
        } else {
          colorMap.set(key, { count: 1, rgb: [rr, gg, bb] })
        }
      }
    }
  }
  
  // Get most frequent colors
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, k * 2) // Get extra colors to choose from
  
  // Create swatches and sort by hue for nice arrangement
  const swatches: Swatch[] = sortedColors.map(([, { rgb }]) => ({
    rgb,
    hex: rgbToHex(rgb[0], rgb[1], rgb[2])
  }))
  
  // Sort by hue for consistent color arrangement
  swatches.sort((a, b) => {
    const [hA] = rgbToHsv(...a.rgb)
    const [hB] = rgbToHsv(...b.rgb)
    return hA - hB
  })
  
  return swatches.slice(0, k)
}
