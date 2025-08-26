import { useEffect, useRef, useState } from 'react'

// Simple color utilities inline for testing
function rgbToHex(r: number, g: number, b: number) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

interface SimpleColor {
  hex: string
  rgb: [number, number, number]
}

function simpleExtractColors(img: HTMLImageElement, count: number): SimpleColor[] {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  // Scale down for performance
  const maxSize = 100
  const scale = Math.min(maxSize / img.width, maxSize / img.height)
  canvas.width = Math.max(1, Math.floor(img.width * scale))
  canvas.height = Math.max(1, Math.floor(img.height * scale))
  
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  // Sample every 4th pixel to get diverse colors
  const colors: SimpleColor[] = []
  for (let i = 0; i < data.length; i += 16) { // Skip 4 pixels each time
    const r = data[i]
    const g = data[i + 1] 
    const b = data[i + 2]
    const a = data[i + 3]
    
    // Only include opaque pixels that aren't too dark or too light
    if (a > 200 && (r + g + b) > 30 && (r + g + b) < 720) {
      const hex = rgbToHex(r, g, b)
      if (!colors.find(c => c.hex === hex)) {
        colors.push({ hex, rgb: [r, g, b] })
      }
    }
    
    if (colors.length >= count * 2) break // Get extra colors to choose from
  }
  
  // Return the most diverse colors
  return colors.slice(0, count)
}

export default function SimpleTest() {
  const [imgSrc, setImgSrc] = useState<string>()
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [colors, setColors] = useState<SimpleColor[]>([])
  const [log, setLog] = useState<string[]>([])
  
  const fileRef = useRef<HTMLInputElement>(null)

  function addLog(message: string) {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  function onFile(file: File) {
    addLog(`File selected: ${file.name}, size: ${file.size}`)
    const reader = new FileReader()
    reader.onload = e => {
      const src = String(e.target?.result)
      setImgSrc(src)
      addLog('File read successfully')
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (!imgSrc) return
    
    addLog('Creating image element')
    const img = new Image()
    img.onload = () => {
      addLog(`Image loaded: ${img.width}x${img.height}`)
      setImage(img)
      
      try {
        const extracted = simpleExtractColors(img, 8)
        setColors(extracted)
        addLog(`Extracted ${extracted.length} colors: ${extracted.map(c => c.hex).join(', ')}`)
      } catch (error) {
        addLog(`ERROR extracting colors: ${error}`)
      }
    }
    img.onerror = () => addLog('ERROR loading image')
    img.src = imgSrc
  }, [imgSrc])

  return (
    <div className="card max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-bold text-center mb-4">Simple Color Extraction Test</h2>
      
      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center mb-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => fileRef.current?.click()}
        >
          Choose Image
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
               onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      </div>

      {/* Image Preview */}
      {imgSrc && (
        <div className="mb-4 text-center">
          <img src={imgSrc} alt="test" className="max-h-64 mx-auto rounded" />
        </div>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Extracted Colors:</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color, i) => (
              <div key={i} className="text-center">
                <div 
                  className="w-16 h-16 rounded border-2 border-gray-300"
                  style={{ backgroundColor: color.hex }}
                  title={color.hex}
                />
                <div className="text-xs mt-1">{color.hex}</div>
                <div className="text-xs text-gray-600">RGB({color.rgb.join(', ')})</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug Log */}
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Debug Log:</h3>
        <div className="text-sm font-mono max-h-40 overflow-y-auto">
          {log.map((entry, i) => (
            <div key={i} className="mb-1">{entry}</div>
          ))}
        </div>
        <button 
          className="text-xs text-blue-600 underline mt-2"
          onClick={() => setLog([])}
        >
          Clear Log
        </button>
      </div>
    </div>
  )
}
