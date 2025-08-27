import { useEffect, useRef, useState } from 'react'
import Palette from './Palette'
import { antiComplementary, antiLowContrast, hexOf } from '../lib/colors'
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
  const [currentHex, setCurrentHex] = useState<string>('#000000')
  const [currentRgb, setCurrentRgb] = useState<[number, number, number]>([0, 0, 0])
  const [isHovering, setIsHovering] = useState(false)
  const [lockedColor, setLockedColor] = useState<{hex: string, rgb: [number, number, number]} | null>(null)

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
      const c = sampleCanvas.current
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext('2d', { willReadFrequently: true })!
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.drawImage(img, 0, 0, c.width, c.height)
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
    if (!image || !imgRef.current || !loupeCanvas.current) return
    
    const imgEl = imgRef.current
    const rect = imgEl.getBoundingClientRect()
    const xDisp = e.clientX - rect.left
    const yDisp = e.clientY - rect.top
    
    // Simple coordinate transformation - assumes image fills container proportionally
    const x = Math.floor((xDisp / imgEl.clientWidth) * image.naturalWidth)
    const y = Math.floor((yDisp / imgEl.clientHeight) * image.naturalHeight)
    
    // Clamp to image bounds
    const clampedX = Math.max(0, Math.min(image.naturalWidth - 1, x))
    const clampedY = Math.max(0, Math.min(image.naturalHeight - 1, y))
    
    // Update loupe
    const loupeSize = 15
    const sx = Math.max(0, Math.min(image.naturalWidth - loupeSize, clampedX - 7))
    const sy = Math.max(0, Math.min(image.naturalHeight - loupeSize, clampedY - 7))

    const lctx = loupeCanvas.current.getContext('2d', { willReadFrequently: true })!
    lctx.imageSmoothingEnabled = false
    lctx.clearRect(0, 0, 96, 96)
    lctx.drawImage(sampleCanvas.current, sx, sy, loupeSize, loupeSize, 0, 0, 96, 96)

    // Get exact pixel color
    const sctx = sampleCanvas.current.getContext('2d', { willReadFrequently: true })!
    const pixelData = sctx.getImageData(clampedX, clampedY, 1, 1).data
    const hex = hexOf([pixelData[0], pixelData[1], pixelData[2]])
    
    setCurrentHex(hex)
    setCurrentRgb([pixelData[0], pixelData[1], pixelData[2]])
    setIsHovering(true)
  }

  function handleLeave() { 
    setIsHovering(false)
  }

  function handleClick(e: React.MouseEvent) {
    if (!image || !imgRef.current) return
    
    const imgEl = imgRef.current
    const rect = imgEl.getBoundingClientRect()
    const xDisp = e.clientX - rect.left
    const yDisp = e.clientY - rect.top
    
    // Use same coordinate transformation as handleMouseMove
    const x = Math.floor((xDisp / imgEl.clientWidth) * image.naturalWidth)
    const y = Math.floor((yDisp / imgEl.clientHeight) * image.naturalHeight)
    
    const clampedX = Math.max(0, Math.min(image.naturalWidth - 1, x))
    const clampedY = Math.max(0, Math.min(image.naturalHeight - 1, y))
    
    const sctx = sampleCanvas.current.getContext('2d', { willReadFrequently: true })!
    const pixelData = sctx.getImageData(clampedX, clampedY, 1, 1).data
    const hex = hexOf([pixelData[0], pixelData[1], pixelData[2]])
    const rgb: [number, number, number] = [pixelData[0], pixelData[1], pixelData[2]]
    
    setLockedColor({ hex, rgb })
    navigator.clipboard.writeText(hex)
  }

  function copyColor() {
    const colorToCopy = lockedColor?.hex || currentHex
    navigator.clipboard.writeText(colorToCopy)
  }

  const displayHex = lockedColor?.hex || currentHex
  const displayRgb = lockedColor?.rgb || currentRgb

  return (
    <div className="card max-w-7xl mx-auto p-6">
      <h2 className="text-xl font-bold text-center mb-3">Single Image</h2>

      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center mb-4 bg-gray-50"
           onDragOver={e => { e.preventDefault() }}
           onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith('image/')) onFile(f) }}>
        <p className="text-gray-600 mb-3">Drop an image here or choose a file</p>
        <button className="px-5 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600"
                onClick={() => fileRef.current?.click()}>Choose Image</button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
               onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      </div>

      {imgSrc && (
        <div className="flex gap-6 mb-4">
          {/* Sidebar with Loupe and Color Info */}
          <div className="w-64 space-y-4">
            {/* Loupe */}
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <h3 className="font-semibold mb-3 text-center">Pixel Loupe</h3>
              <div className="flex justify-center mb-3">
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg ring-2 ring-gray-200 relative">
                  <canvas 
                    ref={loupeCanvas} 
                    width={96} 
                    height={96} 
                    style={{ imageRendering: 'pixelated', width: '100%', height: '100%' }} 
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-px h-6 bg-white/90"></div>
                    <div className="absolute w-6 h-px bg-white/90"></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-gray-500">
                {isHovering ? 'Click to lock color' : 'Move mouse over image'}
              </p>
            </div>

            {/* Color Info */}
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <h3 className="font-semibold mb-3 text-center">
                {lockedColor ? 'Locked Color' : 'Current Color'}
              </h3>
              <div 
                className="w-full h-16 rounded-lg border-2 border-gray-200 mb-3 cursor-pointer transition-all hover:scale-105"
                style={{ backgroundColor: displayHex }}
                onClick={copyColor}
                title="Click to copy hex code"
              />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">HEX:</span>
                  <button 
                    className="font-mono bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                    onClick={copyColor}
                  >
                    {displayHex}
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RGB:</span>
                  <span className="font-mono">
                    ({displayRgb[0]}, {displayRgb[1]}, {displayRgb[2]})
                  </span>
                </div>
              </div>
              <p className="text-xs text-center text-gray-500 mt-3">
                {lockedColor ? 'Click to copy • Click image to change' : 'Click to copy'}
              </p>
            </div>
          </div>

          {/* Main Image */}
          <div className="flex-1 flex justify-center">
            <img 
              ref={imgRef} 
              src={imgSrc} 
              alt="preview" 
              className="max-w-full max-h-96 object-contain rounded-xl shadow-xl cursor-crosshair mx-auto block"
              onMouseMove={handleMouseMove} 
              onMouseLeave={handleLeave} 
              onClick={handleClick} 
            />
          </div>
        </div>
      )}

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

      {colors.length > 0 && (
        <div className="space-y-4">
          <Palette colors={colors} />
          {anti.length > 0 && (
            <div>
              <h3 className="text-center text-red-500 font-bold mb-1">🚫 Colors to Avoid</h3>
              <p className="text-center text-sm text-gray-600 mb-2">
                {antiMode === 'lowcontrast'
                  ? 'Low-contrast neighbors to your palette (avoid for text/UI atop these colors).'
                  : 'Complementary "clash" colors relative to your palette.'}
              </p>
              <Palette colors={anti} danger />
            </div>
          )}
        </div>
      )}

      {lockedColor && (
        <div className="text-center mt-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600">Sampled color: <strong>{lockedColor.hex}</strong> (copied to clipboard)</p>
        </div>
      )}
    </div>
  )
}
