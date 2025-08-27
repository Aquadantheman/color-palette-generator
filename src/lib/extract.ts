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

function colorDistance(c1: [number, number, number], c2: [number, number, number]): number {
  const dr = c1[0] - c2[0]
  const dg = c1[1] - c2[1] 
  const db = c1[2] - c2[2]
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

export function extractColorsFromImage(img: HTMLImageElement, k: number): Swatch[] {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  
  const maxSize = 200
  const scale = Math.min(maxSize / img.width, maxSize / img.height)
  canvas.width = Math.max(1, Math.floor(img.width * scale))
  canvas.height = Math.max(1, Math.floor(img.height * scale))
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const colors: [number, number, number][] = []

  // Grid-based sampling to ensure we get colors from all regions
  const gridSize = Math.max(8, Math.min(16, Math.floor(Math.sqrt(k * 20))))
  const stepX = Math.floor(canvas.width / gridSize)
  const stepY = Math.floor(canvas.height / gridSize)

  for (let y = 0; y < canvas.height; y += stepY) {
    for (let x = 0; x < canvas.width; x += stepX) {
      const i = (y * canvas.width + x) * 4
      const r = data[i]
      const g = data[i + 1] 
      const b = data[i + 2]
      const a = data[i + 3]

      if (a >= 200) {
        const brightness = r + g + b
        if (brightness > 10 && brightness < 760) {
          colors.push([r, g, b])
        }
      }
    }
  }

  // Add random sampling to fill gaps
  const numRandomSamples = Math.min(colors.length, k * 10)
  for (let i = 0; i < numRandomSamples; i++) {
    const randomIndex = Math.floor(Math.random() * (data.length / 4)) * 4
    const r = data[randomIndex]
    const g = data[randomIndex + 1]
    const b = data[randomIndex + 2]
    const a = data[randomIndex + 3]

    if (a >= 200) {
      const brightness = r + g + b
      if (brightness > 10 && brightness < 760) {
        colors.push([r, g, b])
      }
    }
  }

  if (colors.length === 0) return []

  // Diversity-based selection: pick colors that are most different from each other
  const selectedColors: [number, number, number][] = []
  
  // Start with a random color
  selectedColors.push(colors[Math.floor(Math.random() * colors.length)])

  // Iteratively add colors that are most different from existing selections
  while (selectedColors.length < k && selectedColors.length < colors.length) {
    let maxMinDistance = 0
    let bestColor: [number, number, number] | null = null

    for (const color of colors) {
      // Skip if this color is too similar to any already selected color
      let minDistance = Infinity
      for (const selected of selectedColors) {
        const distance = colorDistance(color, selected)
        minDistance = Math.min(minDistance, distance)
      }

      if (minDistance > 20 && minDistance > maxMinDistance) {
        maxMinDistance = minDistance
        bestColor = color
      }
    }

    if (bestColor) {
      selectedColors.push(bestColor)
    } else {
      // If no diverse colors found, add a random remaining color
      const remaining = colors.filter(c => 
        !selectedColors.some(s => colorDistance(c, s) < 20)
      )
      if (remaining.length > 0) {
        selectedColors.push(remaining[Math.floor(Math.random() * remaining.length)])
      } else {
        break
      }
    }
  }

  // Convert to swatches and sort by hue
  const swatches: Swatch[] = selectedColors.map(rgb => ({
    rgb,
    hex: rgbToHex(rgb[0], rgb[1], rgb[2])
  }))

  swatches.sort((a, b) => {
    const [hA] = rgbToHsv(...a.rgb)
    const [hB] = rgbToHsv(...b.rgb)
    return hA - hB
  })

  return swatches
}
