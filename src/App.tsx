import { useState } from 'react'
import SingleImage from './components/SingleImage'
import CompareView from './components/CompareView'

export default function App() {
  const [mode, setMode] = useState<'single' | 'compare'>('single')

  return (
    <main className="container mx-auto max-w-6xl px-4 py-6">
      <div className="card p-6">
        <h1 className="text-3xl font-extrabold text-center mb-2">🎨 Color Palette Generator</h1>
        <p className="text-center text-gray-600 mb-4">Extract palettes, hover-loupe + click-to-sample, compare two images, export JSON/CSS.</p>
        <div className="flex justify-center gap-2 mb-2">
          <button className={`btn ${mode==='single'?'!bg-indigo-500 !text-white !border-indigo-500':''}`} onClick={() => setMode('single')}>Single Image</button>
          <button className={`btn ${mode==='compare'?'!bg-indigo-500 !text-white !border-indigo-500':''}`} onClick={() => setMode('compare')}>Compare Images</button>
        </div>
      </div>
      <div className="mt-4">
        {mode === 'single' ? <SingleImage /> : <CompareView />}
      </div>
    </main>
  )
}
