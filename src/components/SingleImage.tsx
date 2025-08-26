import { useEffect, useRef, useState } from 'react'
import Palette from './Palette'
import { analyze, antiComplementary, antiLowContrast, hexOf, rgbToHsv } from '../lib/colors'
import { extractColorsFromImage } from '../lib/extract'
import { downloadCSS, downloadJSON } from '../lib/download'
import type { Swatch } from '../types'

export default function SingleImage() {
  const [imgSrc, setImgSrc] = useState<string>()
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [colors, setColors] = useState<Swatch[]>([])
  const [anti, setAnti] = useState<Swatch[]>([])
  const [antiMode, setAntiMode] = useState<'complement'|'lowcontrast'>('complement')

  const fileRef = useRef<HTMLInputElement>(null)
  const sampleCanvas = useRef<HTMLCanvasElement>(document.createElement('canvas'))
  const loupeCanvas = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)
  const [lockedHex, setLockedHex] = useState<string>()
  const [lockedRgb, setLockedRgb] = useState<[number, number, number] | undefined>()
  const [showLoupe, setShowLoupe] = useState(false)
  const loupeRef = useRef<HTMLDivElement>(null)

  function onFile(file: File) {
    const reader = new FileReader()
    reader.onload = e => setImgSrc(String(e.target?.result))
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (!imgSrc) return
    const img = new Image()
    img.onload = () => {
      setImage(img)
      // draw original into sample canvas
      const c = sampleCanvas.current
      c.width = img.naturalWidth; c.height = img.naturalHeight
      const ctx = c.getContext('2d', { willReadFrequently: true })!
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.drawImage(img, 0, 0, c.width, c.height)
      // initial palette
      setColors(extractColorsFromImage(img, 5))
      setAnti([])
    }
    img.src = imgSrc
  }, [imgSrc])

  function generate(k: number) {
    if (!image) return
    setColors(extractColorsFromImage(image, k))
    setAnti([])
  }
  function buildAnti() {
    setAnti(antiMode === 'lowcontrast' ? antiLowContrast(colors) : antiComplementary(colors))
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!image || !imgRef.current || !loupeCanvas.current || !loupeRef.current) return
    const imgEl = imgRef.current
    const rect = imgEl.getBoundingClientRect()
    const xDisp = e.clientX - rect.left, yDisp = e.clientY - rect.top
    const sx = Math.max(0, Math.min(sampleCanvas.current.width - 15, Math.floor(xDisp * image.naturalWidth / imgEl.clientWidth) - 7))
    const sy = Math.max(0, Math.min(sampleCanvas.current.height - 15, Math.floor(yDisp * image.naturalHeight / imgEl.clientHeight) - 7))

    const lctx = loupeCanvas.current.getContext('2d', { willReadFrequently: true })!
    lctx.imageSmoothingEnabled = false
    lctx.clearRect(0, 0, 96, 96)
    lctx.drawImage(sampleCanvas.current, sx, sy, 15, 15, 0, 0, 96, 96)

    loupeRef.current.style.left = `${xDisp + 14}px`
    loupeRef.current.style.top = `${yDisp + 14}px`
    setShowLoupe(true)

    const sctx = sampleCanvas.current.getContext('2d', { willReadFrequently: true })!
    const d = sctx.getImageData(sx + 7, sy + 7, 1, 1).data
    const hex = hexOf([d[0], d[1], d[2]])
    loupeRef.current.dataset.hex = hex
  }

  function handleLeave() { setShowLoupe(false) }

  function handleClick(e: React.MouseEvent) {
    if (!image || !imgRef.current || !markerRef.current) return
    const imgEl = imgRef.current
    const rect = imgEl.getBoundingClientRect()
    const xDisp = e.clientX - rect.left, yDisp = e.clientY - rect.top
    const x = Math.floor(xDisp * image.naturalWidth / imgEl.clientWidth)
    const y = Math.floor(yDisp * image.naturalHeight / imgEl.clientHeight)
    const sctx = sampleCanvas.current.getContext('2d', { willReadFrequently: true })!
    const d = sctx.getImageData(x, y, 1, 1).data
    const hex = hexOf([d[0], d[1], d[2]])
    setLockedHex(hex); setLockedRgb([d[0], d[1], d[2]])
    markerRef.current.style.left = `${xDisp}px`
    markerRef.current.style.top = `${yDisp}px`
    markerRef.current.style.background = hex
    markerRef.current.style.display = 'block'
  }

  return (
    <div className="card max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-bold text-center mb-3">Single Image</h2>

      {/* Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center mb-4 bg-gray-50"
           onDragOver={e => { e.preventDefault() }}
           onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith('image/')) onFile(f) }}>
        <p className="text-gray-600 mb-3">Drop an image here or choose a file</p>
        <button className="px-5 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600"
                onClick={() => fileRef.current?.click()}>Choose Image</button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
               onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      </div>

      {/* Preview + Loupe */}
      {imgSrc && (
        <div className="relative mb-4">
          <img ref={imgRef} src={imgSrc} alt="preview" className="mx-auto max-h-80 rounded-xl shadow-xl cursor-crosshair"
               onMouseMove={handleMouseMove} onMouseLeave={handleLeave} onClick={handleClick} />
          <div ref={markerRef} className="hidden absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.25)]"></div>

          <div ref={loupeRef}
               className={`absolute w-24 h-24 rounded-full overflow-hidden shadow-xl ring-2 ring-white ${showLoupe ? 'block' : 'hidden'}`}>
            <canvas ref={loupeCanvas} width={96} height={96} style={{ imageRendering: 'pixelated', width: '100%', height: '100%' }} />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-x-1/2 -translate-x-1/2 w-px h-full bg-white/90"></div>
              <div className="absolute inset-y-1/2 -translate-y-1/2 h-px w-full bg-white/90"></div>
            </div>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-lg bg-black text-white text-[11px] px-2 py-1 whitespace-nowrap">
              {loupeRef.current?.dataset.hex ?? '—'}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {image && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {[5,8,10].map(k => (
            <button key={k} className="btn" onClick={() => generate(k)}>{k} Colors</button>
          ))}
          <button className="btn" onClick={buildAnti}>⚠️ Anti-Palette</button>
          <select className="btn py-2" value={antiMode} onChange={e => setAntiMode(e.target.value as any)}>
            <option value="complement">Complementary clash</option>
            <option value="lowcontrast">Low-contrast (UI)</option>
          </select>
          <button className="btn" onClick={() => downloadJSON(colors, anti)}>Export JSON</button>
          <button className="btn" onClick={() => downloadCSS(colors)}>Export CSS Vars</button>
        </div>
      )}

      {/* Palettes */}
      {colors.length > 0 && (
        <div className="space-y-4">
          <Palette colors={colors} />
          {anti.length > 0 && (
            <div>
              <h3 className="text-center text-red-500 font-bold mb-1">🚫 Colors to Avoid</h3>
              <p className="text-center text-sm text-gray-600 mb-2">
                {antiMode === 'lowcontrast'
                  ? 'Low-contrast neighbors to your palette (avoid for text/UI atop these colors).'
                  : 'Complementary “clash” colors relative to your palette.'}
              </p>
              <Palette colors={anti} danger />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

