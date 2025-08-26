import { textColorFor } from '../lib/colors'
import type { Swatch } from '../types'

export default function Palette({ colors, danger }: { colors: Swatch[]; danger?: boolean }) {
  return (
    <div className={`w-full h-28 rounded-xl overflow-hidden shadow-2xl ${danger ? 'ring-4 ring-red-400/60 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,53,69,.08)_10px,rgba(220,53,69,.08)_20px)]' : ''}`}>
      <div className="flex w-full h-full">
        {colors.map((c) => (
          <button
            key={c.hex}
            onClick={() => navigator.clipboard.writeText(c.hex)}
            className="relative flex-1 flex items-end justify-center px-2 pb-2 transition hover:scale-[1.02]"
            style={{ background: c.hex, color: textColorFor(c.rgb) }}
            title={`Click to copy ${c.hex}`}
          >
            <div className="text-center">
              <div className="text-xs font-extrabold tracking-wide">{c.hex}</div>
              <div className="text-[10px] opacity-90">{`RGB(${c.rgb[0]}, ${c.rgb[1]}, ${c.rgb[2]})`}</div>
            </div>
            {danger && <div className="absolute right-1 top-1">⚠️</div>}
          </button>
        ))}
      </div>
    </div>
  )
}

