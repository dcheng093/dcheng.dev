// Tiny WebAudio chiptune + SFX. No audio files: swap in a real loop later via public/loop.mp3.

export type MixId = 'system-default' | 'dial-up' | 'elevator' | 'nightcore'

export const MIXES: { id: MixId; label: string; bpm: number; lead: OscillatorType; bass: OscillatorType; transpose: number }[] = [
  { id: 'system-default', label: 'System Default', bpm: 132, lead: 'square', bass: 'triangle', transpose: 0 },
  { id: 'dial-up', label: 'Dial-Up Remix', bpm: 104, lead: 'sawtooth', bass: 'square', transpose: -5 },
  { id: 'elevator', label: 'Elevator (Going Down)', bpm: 84, lead: 'sine', bass: 'sine', transpose: 0 },
  { id: 'nightcore', label: 'Nightcore Daniel', bpm: 176, lead: 'square', bass: 'square', transpose: 12 },
]

// 32 sixteenth-note steps; numbers are semitones above A3, null is a rest.
const LEAD: (number | null)[] = [
  12, null, 15, 17, 19, null, 17, 15, 12, null, 10, 12, 15, null, null, null,
  12, null, 15, 17, 19, 22, 24, null, 22, 19, 17, 15, 17, null, 12, null,
]
const BASS: (number | null)[] = [
  0, null, 0, null, 7, null, 7, null, 5, null, 5, null, 3, null, 3, null,
  0, null, 0, null, 7, null, 7, null, 10, null, 10, null, 7, null, 5, null,
]

const freq = (semi: number) => 220 * 2 ** (semi / 12)

function blip(ctx: AudioContext, dest: AudioNode, type: OscillatorType, f: number, at: number, dur: number, vol: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(f, at)
  gain.gain.setValueAtTime(vol, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  osc.connect(gain).connect(dest)
  osc.start(at)
  osc.stop(at + dur + 0.02)
}

export class Chiptune {
  private timer: number | null = null
  private step = 0
  private nextAt = 0
  private ctx: AudioContext
  private dest: AudioNode

  constructor(ctx: AudioContext, dest: AudioNode) {
    this.ctx = ctx
    this.dest = dest
  }

  start(mixId: MixId) {
    this.stop()
    const mix = MIXES.find((m) => m.id === mixId) ?? MIXES[0]
    const stepDur = 60 / mix.bpm / 4
    this.nextAt = this.ctx.currentTime + 0.05
    // Lookahead scheduler: wake every 25ms, queue anything due in the next 120ms.
    this.timer = window.setInterval(() => {
      while (this.nextAt < this.ctx.currentTime + 0.12) {
        const i = this.step % LEAD.length
        const lead = LEAD[i]
        const bass = BASS[i]
        if (lead != null) blip(this.ctx, this.dest, mix.lead, freq(lead + mix.transpose), this.nextAt, stepDur * 0.9, 0.06)
        if (bass != null) blip(this.ctx, this.dest, mix.bass, freq(bass + mix.transpose - 12), this.nextAt, stepDur * 1.8, 0.09)
        if (i % 4 === 0) blip(this.ctx, this.dest, 'square', 60, this.nextAt, 0.05, 0.08)
        this.nextAt += stepDur
        this.step++
      }
    }, 25)
  }

  stop() {
    if (this.timer != null) window.clearInterval(this.timer)
    this.timer = null
  }
}

export type SfxName = 'click' | 'hover' | 'ding' | 'error' | 'coin'

export function playSfx(ctx: AudioContext, dest: AudioNode, name: SfxName) {
  const t = ctx.currentTime
  switch (name) {
    case 'click':
      return blip(ctx, dest, 'square', 880, t, 0.04, 0.08)
    case 'hover':
      return blip(ctx, dest, 'triangle', 1320, t, 0.015, 0.03)
    case 'ding':
      blip(ctx, dest, 'sine', 1046, t, 0.15, 0.12)
      return blip(ctx, dest, 'sine', 1568, t + 0.12, 0.3, 0.12)
    case 'error':
      return blip(ctx, dest, 'sawtooth', 110, t, 0.25, 0.1)
    case 'coin':
      blip(ctx, dest, 'square', 988, t, 0.08, 0.08)
      return blip(ctx, dest, 'square', 1319, t + 0.08, 0.3, 0.08)
  }
}
