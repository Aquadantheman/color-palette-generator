import { useState } from 'react'
import SimpleTest from './components/SimpleTest'

export default function App() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-6">
      <div className="card p-6">
        <h1 className="text-3xl font-extrabold text-center mb-2">Color Palette Generator - Debug</h1>
      </div>
      <div className="mt-4">
        <SimpleTest />
      </div>
    </main>
  )
}
