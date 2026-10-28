// Minimal GIF block walker: logical size, frame count, summed delays, palette sizes, transparency.
export function parseGif(b) {
  const width = b[6] | (b[7] << 8)
  const height = b[8] | (b[9] << 8)
  const flags = b[10]
  const globalPalette = flags & 0x80 ? 2 << (flags & 7) : 0
  let i = 13 + 3 * globalPalette
  let frames = 0
  let delayCs = 0
  let localPalette = 0
  let transparent = false
  while (i < b.length) {
    const block = b[i]
    if (block === 0x21) {
      const label = b[i + 1]
      i += 2
      if (label === 0xf9) {
        delayCs += b[i + 2] | (b[i + 3] << 8)
        transparent ||= Boolean(b[i + 1] & 1)
      }
      while (i < b.length && b[i]) i += b[i] + 1
      i++
    } else if (block === 0x2c) {
      frames++
      const pf = b[i + 9]
      i += 10
      if (pf & 0x80) {
        localPalette = Math.max(localPalette, 2 << (pf & 7))
        i += 3 * (2 << (pf & 7))
      }
      i++
      while (i < b.length && b[i]) i += b[i] + 1
      i++
    } else break
  }
  return { bytes: b.length, width, height, frames, loopSeconds: delayCs / 100, globalPalette, localPalette, transparent }
}

/** Multiplies every frame delay in place (Graphic Control Extension blocks); returns the new delays in ms. */
export function slowGif(b, factor) {
  const flags = b[10]
  let i = 13 + (flags & 0x80 ? 3 * (2 << (flags & 7)) : 0)
  const delays = []
  while (i < b.length) {
    if (b[i] === 0x21) {
      if (b[i + 1] === 0xf9) {
        const d = Math.min(0xffff, Math.round(b.readUInt16LE(i + 4) * factor))
        b.writeUInt16LE(d, i + 4)
        delays.push(d * 10)
      }
      i += 2
      while (i < b.length && b[i]) i += b[i] + 1
      i++
    } else if (b[i] === 0x2c) {
      const pf = b[i + 9]
      i += 10
      if (pf & 0x80) i += 3 * (2 << (pf & 7))
      i++
      while (i < b.length && b[i]) i += b[i] + 1
      i++
    } else break
  }
  return delays
}
