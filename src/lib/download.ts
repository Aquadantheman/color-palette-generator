import type { Swatch } from '../types'

export function downloadJSON(main: Swatch[], anti: Swatch[]) {
  const data = {
    mainColors: main.map(c => ({ hex: c.hex, rgb: c.rgb })),
    antiColors: anti.map(c => ({ hex: c.hex, rgb: c.rgb })),
    timestamp: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: `palette-${Date.now()}.json` })
  a.click(); URL.revokeObjectURL(url)
}

export function downloadCSS(main: Swatch[]) {
  const lines = main.map((c, i) => `  --palette-${i + 1}: ${c.hex};`).join('\n')
  const css = `:root{\n${lines}\n}\n`
  const blob = new Blob([css], { type: 'text/css' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: `palette-${Date.now()}.css` })
  a.click(); URL.revokeObjectURL(url)
}

