import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { readFileSync, writeFileSync } from 'node:fs'
import { GIFEncoder, quantize, applyPalette } from '/tmp/claude-1000/-mnt-c-Users-User-Documents-Code-WEBSITE/f054c6ed-b5bb-4463-8584-7eab74e2b640/scratchpad/enc/node_modules/gifenc/dist/gifenc.esm.js'
const [src, out, libs] = process.argv.slice(2)
const srv = createServer((q, s) => s.end('<!doctype html><title>x</title>')); await new Promise((ok) => srv.listen(4597, ok))
const b = await chromium.launch({ env: { ...process.env, LD_LIBRARY_PATH: libs } })
const p = await b.newPage(); await p.goto('http://localhost:4597/')
const decode = (buf) => p.evaluate(async (b64) => {
  const data = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  const d = new ImageDecoder({ data, type: 'image/gif' }); await d.tracks.ready
  const n = d.tracks.selectedTrack.frameCount, frames = []
  for (let i = 0; i < n; i++) {
    const { image } = await d.decode({ frameIndex: i })
    const c = new OffscreenCanvas(image.displayWidth, image.displayHeight), x = c.getContext('2d'); x.drawImage(image, 0, 0)
    const px = new Uint8Array(x.getImageData(0, 0, c.width, c.height).data.buffer); let s = ''
    for (let j = 0; j < px.length; j += 0x8000) s += String.fromCharCode(...px.subarray(j, j + 0x8000))
    frames.push({ w: c.width, h: c.height, delay: image.duration / 1000, b64: btoa(s) })
  }
  return frames
}, buf.toString('base64'))
const frames = (await decode(readFileSync(src))).map((f) => ({ ...f, rgba: new Uint8Array(Buffer.from(f.b64, 'base64')) }))
console.log('original', readFileSync(src).length, 'bytes', frames.length, 'frames', frames[0].w + 'x' + frames[0].h)
const encode = (name, step, colors) => {
  const g = GIFEncoder()
  for (let i = 0; i < frames.length; i += step) {
    const f = frames[i], delay = frames.slice(i, i + step).reduce((t, x) => t + x.delay, 0)
    const palette = quantize(f.rgba, colors), index = applyPalette(f.rgba, palette)
    g.writeFrame(index, f.w, f.h, { palette, delay })
  }
  g.finish(); const bytes = g.bytes(); writeFileSync(`${out}/cs-${name}.gif`, bytes)
  console.log(name, bytes.length, 'bytes', Math.ceil(frames.length / step), 'frames')
}
encode('A-8fps-256', 2, 256)
encode('B-8fps-128', 2, 128)
encode('C-8fps-64', 2, 64)
await b.close(); srv.close()
