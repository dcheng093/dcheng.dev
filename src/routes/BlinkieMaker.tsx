import { useEffect, useRef, useState } from 'react'
import { useSfx } from '../audio/audioContext'
import { Img } from '../components/media/Img'
import { WavyText } from '../components/chaos/Chaos'
import { blinkies, cursors } from '../content/assets'
import { drawFrame, EFFECTS, encodeBlinkie, FONTS, SIZES, timing, type BlinkieOpts } from '../lib/blinkie'
import { gifCursor } from '../lib/cursor'

const PRESETS: { label: string; fg: string; bg: string }[] = [
  { label: 'Classic Pink', fg: '#ff66cc', bg: '#330033' },
  { label: 'Matrix', fg: '#00ff00', bg: '#000000' },
  { label: 'Hazard', fg: '#000000', bg: '#ffcc00' },
  { label: 'Ocean', fg: '#ccffff', bg: '#003399' },
]

/** Make your own blinkie (150×20) or 88×31 button, preview it live, download a real animated GIF. */
export function BlinkieMaker() {
  const [opts, setOpts] = useState<BlinkieOpts>({ text: 'I ♥ DANIEL', size: 'blinkie', font: 'pixel', fg: '#ff66cc', bg: '#330033', effect: 'blink' })
  const [fontsReady, setFontsReady] = useState(() => !document.fonts?.load)
  const [busy, setBusy] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const sfx = useSfx()
  const set = (patch: Partial<BlinkieOpts>) => setOpts((o) => ({ ...o, ...patch }))
  const { w, h } = SIZES[opts.size]

  // Canvas text needs the web fonts actually loaded, or the first frames draw in a fallback font.
  useEffect(() => {
    if (fontsReady) return
    void Promise.all(FONTS.map((f) => document.fonts.load(`${f.px}px ${f.css}`))).finally(() => setFontsReady(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
  }, [])

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx || !fontsReady) return
    let i = 0
    drawFrame(ctx, opts, i)
    const t = window.setInterval(() => drawFrame(ctx, opts, ++i % timing(opts.effect).frames), timing(opts.effect).delay)
    return () => window.clearInterval(t)
  }, [opts, fontsReady])

  const download = () => {
    setBusy(true)
    // Let the button repaint as "ENCODING…" before the (brief) blocking encode.
    window.setTimeout(() => {
      const bytes = encodeBlinkie(opts)
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'image/gif' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `${opts.text.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'blinkie'}-${w}x${h}.gif`
      a.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setBusy(false)
      sfx('coin')
    }, 30)
  }

  const label = 'block font-bold'
  return (
    <div data-testid="blinkie-maker" className="tile-blinkie min-h-screen p-3 sm:p-6" style={{ cursor: gifCursor(cursors.pencilGuy) }}>
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-center font-pixel text-xl leading-relaxed text-white [text-shadow:3px_3px_0_#f0c] sm:text-3xl">
          <WavyText text="BLINKIE MAKER 2000" />
        </h1>
        <div className="flex flex-wrap justify-center gap-1" aria-label="Blinkies from around the site">
          {Object.values(blinkies).slice(0, 6).map((b) => (
            <Img key={b.src} slot={b} />
          ))}
        </div>

        <section className="win-raised space-y-3 p-3 text-sm text-black">
          <div className="grid place-items-center bg-[repeating-conic-gradient(#ccc_0_25%,#fff_0_50%)_0_0/16px_16px] py-6">
            <canvas ref={canvas} width={w} height={h} data-testid="blinkie-preview" aria-label={`Preview: ${opts.text}`} className="scale-[2] [image-rendering:pixelated]" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="bl-text">Text</label>
              <input id="bl-text" value={opts.text} maxLength={40} onChange={(e) => set({ text: e.target.value })} className="win-sunken w-full bg-white px-2 py-1" />
            </div>
            <fieldset>
              <legend className={label}>Size</legend>
              {(['blinkie', 'button'] as const).map((s) => (
                <label key={s} className="mr-3">
                  <input type="radio" name="bl-size" checked={opts.size === s} onChange={() => set({ size: s })} /> {s === 'blinkie' ? 'Blinkie 150×20' : 'Button 88×31'}
                </label>
              ))}
            </fieldset>
            <div>
              <label className={label} htmlFor="bl-font">Font</label>
              <select id="bl-font" value={opts.font} onChange={(e) => set({ font: e.target.value })} className="win-sunken w-full bg-white px-1 py-1">
                {FONTS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className={label}>Effect</legend>
              {EFFECTS.map((e) => (
                <label key={e.id} className="mr-3">
                  <input type="radio" name="bl-effect" checked={opts.effect === e.id} onChange={() => set({ effect: e.id })} /> {e.label}
                </label>
              ))}
            </fieldset>
            <div className="flex gap-3">
              <label>Text <input type="color" value={opts.fg} onChange={(e) => set({ fg: e.target.value })} aria-label="Text colour" /></label>
              <label>Background <input type="color" value={opts.bg} onChange={(e) => set({ bg: e.target.value })} aria-label="Background colour" /></label>
            </div>
            <div className="flex flex-wrap gap-1">
              {PRESETS.map((p) => (
                <button key={p.label} type="button" onClick={() => set({ fg: p.fg, bg: p.bg })} className="win-raised px-1 text-xs" style={{ color: p.fg, background: p.bg }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={download} disabled={busy || !fontsReady || !opts.text.trim()} className="win-raised w-full py-2 font-impact text-xl text-[#c06] disabled:opacity-50">
            {busy ? 'ENCODING…' : '💾 DOWNLOAD .GIF'}
          </button>
          <p className="text-xs text-gray-700">Free for your own homepage. Credit not required, but Daniel would be thrilled.</p>
        </section>
      </div>
    </div>
  )
}
