import type { RGB, Swatch } from '../types'

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
export const clamp8 = (v: number) => clamp(Math.round(v), 0, 255)

export function rgbToHex(r: number, g: number, b: number) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}
export function hexOf(rgb: RGB) { return rgbToHex(rgb[0], rgb[1], rgb[2]).toUpperCase() }

export function textColorFor(rgb: RGB) {
  const [r, g, b] = rgb.map(v => v / 255)
  const lin = [r, g, b].map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  const L = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
  return L > 0.179 ? '#000' : '#fff'
}

/* --- RGB<->Lab --- */
function rgb2xyz([r, g, b]: RGB) {
  r /= 255; g /= 255; b /= 255
  ;[r, g, b] = [r, g, b].map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as RGB
  return [
    0.4124 * r + 0.3576 * g + 0.1805 * b,
    0.2126 * r + 0.7152 * g + 0.0722 * b,
    0.0193 * r + 0.1192 * g + 0.9505 * b
  ]
}
function xyz2lab([x, y, z]: number[]) {
  const xr = x / 0.95047, yr = y / 1.0, zr = z / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(xr), fy = f(yr), fz = f(zr)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}
export function rgb2lab(rgb: RGB) { return xyz2lab(rgb2xyz(rgb)) }
export function lab2rgb([L, a, b]: number[]): RGB {
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200
  const fInv = (t: number) => {
    const t3 = t * t * t
    return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787
  }
  const xr = fInv(fx), yr = fInv(fy), zr = fInv(fz)
  let x = 0.95047 * xr, y = 1.0 * yr, z = 1.08883 * zr
  let r = 3.2406 * x + -1.5372 * y + -0.4986 * z
  let g = -0.9689 * x + 1.8758 * y + 0.0415 * z
  let b2 = 0.0557 * x + -0.2040 * y + 1.0570 * z
  const comp = (c: number) => {
    c = clamp(c, 0, 1)
    return clamp8(c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
  }
  return [comp(r), comp(g), comp(b2)]
}
export function deltaE76(l1: number[], l2: number[]) {
  const dL = l1[0] - l2[0], da = l1[1] - l2[1], db = l1[2] - l2[2]
  return Math.sqrt(dL * dL + da * da + db * db)
}

/* --- k-means++ in Lab --- */
export function kMeansLab(pixelsRGB: RGB[], k: number): Swatch[] {
  if (!pixelsRGB.length || k <= 0) return []
  const labs = pixelsRGB.map(rgb2lab)
  const centers: number[][] = [labs[Math.floor(Math.random() * labs.length)]]
  while (centers.length < k) {
    const dists = labs.map(p => Math.min(...centers.map(c => deltaE76(p, c))))
    const sum = dists.reduce((a, b) => a + b, 0) || 1
    let r = Math.random() * sum, idx = 0
    for (let i = 0; i < dists.length; i++) { r -= dists[i]; if (r <= 0) { idx = i; break } }
    centers.push(labs[idx])
  }
  for (let it = 0; it < 10; it++) {
    const clusters: number[][][] = Array.from({ length: k }, () => [])
    for (const p of labs) {
      let bi = 0, bd = 1e9
      for (let i = 0; i < k; i++) { const d = deltaE76(p, centers[i]); if (d < bd) { bd = d; bi = i } }
      clusters[bi].push(p)
    }
    for (let i = 0; i < k; i++) {
      const c = clusters[i]; if (c.length) {
        centers[i] = [
          c.reduce((a, p) => a + p[0], 0) / c.length,
          c.reduce((a, p) => a + p[1], 0) / c.length,
          c.reduce((a, p) => a + p[2], 0) / c.length
        ]
      }
    }
  }
  const out: Swatch[] = centers.map(lab => {
    const rgb = lab2rgb(lab)
    return { rgb, hex: hexOf(rgb) }
  })
  // simple sort by hue/sat/value for nice ordering
  out.sort((A, B) => {
    const [ha, sa, va] = rgbToHsv(A.rgb), [hb, sb, vb] = rgbToHsv(B.rgb)
    return ha - hb || sb - sa || vb - va
  })
  return out
}

/* --- HSV (for sorting) --- */
export function rgbToHsv([r, g, b]: RGB): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h = Math.round((h < 0 ? h + 6 : h) * 60)
  const s = max === 0 ? 0 : d / max
  const v = max
  return [h, s, v]
}

/* --- Anti-palettes --- */
export function antiComplementary(main: Swatch[]): Swatch[] {
  const MIN_DE = 35, L_STEP = 6, SAT_SCALE = 1.2
  return main.map(c => {
    const lab0 = rgb2lab(c.rgb)
    let comp: number[] = [100 - lab0[0], -lab0[1], -lab0[2]]
    let tries = 0
    while (deltaE76(lab0, comp) < MIN_DE && tries < 8) {
      comp = [clamp(comp[0] + (comp[0] > 50 ? L_STEP : -L_STEP), 0, 100), comp[1] * SAT_SCALE, comp[2] * SAT_SCALE]
      tries++
    }
    const rgb = lab2rgb(comp)
    return { rgb, hex: hexOf(rgb) }
  })
}

export function antiLowContrast(main: Swatch[]): Swatch[] {
  return main.map(c => {
    const lab = rgb2lab(c.rgb)
    const L = lab[0]
    let candidate: number[] = [clamp(L + (L > 50 ? -3 : 3), 0, 100), lab[1] * 0.88, lab[2] * 0.88]
    let rgb = lab2rgb(candidate)
    let hex = hexOf(rgb)
    if (hex === c.hex.toUpperCase()) {
      candidate = [clamp(L + (L > 50 ? -8 : 8), 0, 100), lab[1] * 0.8, lab[2] * 0.8]
      rgb = lab2rgb(candidate); hex = hexOf(rgb)
    }
    if (hex === c.hex.toUpperCase()) {
      rgb = [clamp8(rgb[0] + (rgb[0] > 127 ? -12 : 12)), clamp8(rgb[1] + (rgb[1] > 127 ? -12 : 12)), clamp8(rgb[2] + (rgb[2] > 127 ? -12 : 12))]
      hex = hexOf(rgb)
    }
    return { rgb, hex }
  })
}

/* --- Palette distance / analysis --- */
export function deltaPalette(a: Swatch[], b: Swatch[]) {
  const la = a.map(s => rgb2lab(s.rgb)), lb = b.map(s => rgb2lab(s.rgb))
  const meanNN = (A: number[][], B: number[][]) =>
    A.reduce((acc, p) => acc + B.reduce((m, q) => Math.min(m, deltaE76(p, q)), 1e9), 0) / A.length
  return (meanNN(la, lb) + meanNN(lb, la)) / 2
}

export function analyze(a: Swatch[], b: Swatch[]) {
  const d = deltaPalette(a, b)
  const score = Math.max(0, Math.min(100, Math.round(100 - d)))
  const label = score >= 80 ? 'Excellent Match!' : score >= 60 ? 'Good Harmony' : 'Decent Pairing'
  const description =
    score >= 80 ? 'These palettes are naturally complementary.' :
    score >= 60 ? 'These work well together; consider bridge colors.' :
                  'There’s some tension—use bridge colors or adjust saturation/lightness.'
  // bridges = midpoints between nearest neighbors
  const la = a.map(s => rgb2lab(s.rgb)), lb = b.map(s => rgb2lab(s.rgb))
  const bridges: Swatch[] = []
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const p = la[i % la.length]
    let bi = 0, bd = 1e9
    for (let j = 0; j < lb.length; j++) { const d2 = deltaE76(p, lb[j]); if (d2 < bd) { bd = d2; bi = j } }
    const mid = [(p[0] + lb[bi][0]) / 2, (p[1] + lb[bi][1]) / 2, (p[2] + lb[bi][2]) / 2]
    const rgb = lab2rgb(mid); const hex = hexOf(rgb)
    if (!bridges.find(x => x.hex === hex)) bridges.push({ rgb, hex })
  }
  return { score, label, description, bridgeColors: bridges.slice(0, 5) }
}

