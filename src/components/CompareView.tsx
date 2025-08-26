import { useRef, useState } from 'react'
import Palette from './Palette'
import { analyze } from '../lib/colors'
import { extractColorsFromImage } from '../lib/extract'
import type { Analysis, Swatch } from '../types'

export default function CompareView() {
  const [src1, setSrc1] = useState<string>()
  const [src2, setSrc2] = useState<string>()
  const [img1, setImg1] = useState<HTMLImageElement | null>(null)
  const [img2, setImg2] = useState<HTMLImageElement | null>(null)
  const [k, setK] = useState(5)
  const [p1, setP1] = useState<Swatch[]>([])
  const [p2, setP2] = useState<Swatch[]>([])
  const [analysis, setAnalysis] = useState<Analysis | null>(null)

  const input1 = useRef<HTMLInputElement>(null)
  const input2 = useRef<HTMLInputElement>(null)

  function load(file: File, which: 1|2) {
    const reader = new FileReader()
    reader.onload = e => {
      const src = String(e.target?.result)
      const img = new Image()
      img.onload = () => {
        if (which === 1) { setImg1(img); setSrc1(src) } else { setImg2(img); setSrc2(src) }
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  function run() {
    if (!img1 || !img2) return
    const c1 = extractColorsFromImage(img1, k)
    const c2 = extractColorsFromImage(img2, k)
    setP1(c1); setP2(c2)
    setAnalysis(analyze(c1, c2) as Analysis)
  }

  return (
    <div className="card max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-bold text-center mb-4">Compare Images</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {[1,2].map(which => (
          <div key={which}>
            <h3 className="text-center font-semibold mb-2">Image {which}</h3>
            <div
              className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center bg-gray-50"
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) load(f, which as 1|2) }}
            >
              <p className="text-gray-600 mb-3">Drop image or choose file</p>
              <button className="px-5 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600"
                      onClick={() => (which === 1 ? input1.current : input2.current)?.click()}>
                Choose Image {which}
              </button>
              <input ref={which === 1 ? input1 : input2} type="file" accept="image/*" className="hidden"
                     onChange={e => { const f = e.target.files?.[0]; if (f) load(f, which as 1|2) }} />
            </div>
            {(which === 1 ? src1 : src2) && (
              <img src={(which === 1 ? src1 : src2)!} className="mx-auto max-h-64 rounded-xl shadow-xl mt-3" />
            )}
          </div>
        ))}
      </div>

      {(img1 && img2) && (
        <div className="flex flex-wrap items-center justify-center gap-3 my-4">
          <label className="font-bold">Colors per image:</label>
          <select className="btn py-2" value={k} onChange={e => setK(parseInt(e.target.value))}>
            {[5,8,10].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button className="btn" onClick={run}>🔍 Analyze Compatibility</button>
        </div>
      )}

      {analysis && (
        <>
          <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl py-6 my-3 shadow">
            <div className={`text-4xl font-extrabold ${analysis.score>=80?'text-green-600':analysis.score>=60?'text-amber-500':'text-red-600'}`}>
              {analysis.score}%
            </div>
            <div className="font-extrabold">{analysis.label}</div>
            <div className="text-gray-600">{analysis.description}</div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 my-3">
            <div className="bg-white rounded-2xl p-3 shadow w-[min(560px,44vw)]">
              <h4 className="text-center font-semibold mb-2">Image 1 Palette</h4>
              <Palette colors={p1} />
            </div>
            <div className="bg-white rounded-2xl p-3 shadow w-[min(560px,44vw)]">
              <h4 className="text-center font-semibold mb-2">Image 2 Palette</h4>
              <Palette colors={p2} />
            </div>
          </div>

          {analysis.bridgeColors.length > 0 && (
            <div className="mt-4">
              <h3 className="text-center text-indigo-600 font-bold mb-2">🌈 Bridge Colors</h3>
              <div className="max-w-4xl mx-auto">
                <Palette colors={analysis.bridgeColors} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

