/** What the certificate records about someone's descent. */
export type Descent = {
  name: string
  /** When they first reached the shrine (ISO), if known. */
  heard: string | null
  /** When they reached the bottom (ISO). */
  finished: string
  visits: number
  dex: { found: number; total: number }
}

const date = (iso: string) => new Date(iso).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })

/** "3 days, 4 hours" / "2 hours, 5 minutes" / "12 minutes". */
export function took(fromIso: string, toIso: string) {
  const mins = Math.max(0, Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 60000))
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = mins % 60
  const part = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`
  if (d) return `${part(d, 'day')}, ${part(h, 'hour')}`
  if (h) return `${part(h, 'hour')}, ${part(m, 'minute')}`
  return part(m, 'minute')
}

/** The certificate's lines, top to bottom (pure, so it can be tested without a canvas). */
export function certificateLines(d: Descent) {
  return {
    title: 'CERTIFICATE OF DESCENT',
    name: d.name,
    verb: 'DESCENDED',
    facts: [
      d.heard ? `First heard the song: ${date(d.heard)}` : 'First heard the song: a night they remember',
      `Reached the bottom: ${date(d.finished)}`,
      ...(d.heard ? [`It took: ${took(d.heard, d.finished)}`] : []),
      `Visits: ${d.visits}   ·   Specimens catalogued: ${d.dex.found} of ${d.dex.total}`,
    ],
    seal: '37093',
    footer: 'enlightenment was upon you. now it is yours.',
  }
}

/**
 * Draws the certificate (1600×1000): dawn behind, the sigil, their name, the record of how they got here. Holds
 * nothing they haven't earned, and no answers.
 */
export function drawCertificate(canvas: HTMLCanvasElement, d: Descent) {
  const W = 1600
  const H = 1000
  canvas.width = W
  canvas.height = H
  const g = canvas.getContext('2d')
  if (!g) return false
  const l = certificateLines(d)

  const dawn = g.createLinearGradient(0, 0, 0, H)
  dawn.addColorStop(0, '#2a0a1a')
  dawn.addColorStop(0.45, '#c8573a')
  dawn.addColorStop(0.75, '#f3c27a')
  dawn.addColorStop(1, '#fff3d6')
  g.fillStyle = dawn
  g.fillRect(0, 0, W, H)
  // A frame, like a real certificate.
  g.strokeStyle = '#5a3a00'
  g.lineWidth = 6
  g.strokeRect(40, 40, W - 80, H - 80)
  g.lineWidth = 2
  g.strokeRect(58, 58, W - 116, H - 116)

  // The sigil: two triangles and an eye, now open to the light.
  g.save()
  g.translate(W / 2, 230)
  g.strokeStyle = '#3a2400'
  g.lineWidth = 3
  for (const flip of [1, -1]) {
    g.beginPath()
    g.moveTo(0, -95 * flip)
    g.lineTo(82, 48 * flip)
    g.lineTo(-82, 48 * flip)
    g.closePath()
    g.stroke()
  }
  g.beginPath()
  g.moveTo(-46, 0)
  g.quadraticCurveTo(0, -34, 46, 0)
  g.quadraticCurveTo(0, 34, -46, 0)
  g.fillStyle = '#fff3d6'
  g.fill()
  g.stroke()
  g.beginPath()
  g.arc(0, 0, 13, 0, Math.PI * 2)
  g.fillStyle = '#c8573a'
  g.fill()
  g.restore()

  g.textAlign = 'center'
  g.fillStyle = '#2a1400'
  g.font = 'bold 44px "Times New Roman", serif'
  g.fillText(l.title, W / 2, 420)
  g.font = 'italic 34px "Times New Roman", serif'
  g.fillText('this certifies that', W / 2, 480)
  g.font = 'bold 84px "Times New Roman", serif'
  g.fillText(l.name, W / 2, 575, W - 240)
  g.font = 'bold 40px "Times New Roman", serif'
  g.fillText(l.verb, W / 2, 635)
  g.font = '26px "Courier New", monospace'
  l.facts.forEach((f, i) => g.fillText(f, W / 2, 715 + i * 40, W - 200))
  g.font = 'italic 28px "Times New Roman", serif'
  g.fillText(l.footer, W / 2, 900)
  g.font = 'bold 26px "Courier New", monospace'
  g.textAlign = 'right'
  g.fillText(`— ${l.seal}`, W - 110, 900)
  return true
}

/** Draws it and hands it over as a PNG download. */
export function downloadCertificate(d: Descent) {
  const canvas = document.createElement('canvas')
  if (!drawCertificate(canvas, d)) return
  canvas.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `descended-${d.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'someone'}.png`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(a.href), 4000)
  }, 'image/png')
}
