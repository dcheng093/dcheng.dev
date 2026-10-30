// node scripts/possessed-assets.mjs: turns Daniel's possessed textures into what the site actually loads: seamless
// tiles (mirrored 2×2, so a non-tiling picture tiles without seams), web-sized stills, small PBR maps for the flesh
// world, and the Gulag Games ad art. Headless Chromium's canvas does the resizing. Outputs are committed.
// Sources live in asset-originals/possessed/ (gitignored, like the other originals): drop new ones in public/me/ and
// this moves them there on its next run, so the raw files never get deployed.
import { chromium } from 'playwright'
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCES = resolve(ROOT, 'asset-originals/possessed')
mkdirSync(SOURCES, { recursive: true })
/** A source picture: from asset-originals/possessed/, moving it there from public/me/ if it was just dropped in. */
const ME = (f) => {
  const kept = resolve(SOURCES, f)
  const dropped = resolve(ROOT, 'public/me', f)
  if (existsSync(dropped)) renameSync(dropped, kept)
  return kept
}

// [source in public/me, output path in public/, mode, size]
// tile: scaled so a tile is at most `size` px, mirrored 2×2 (seamless). pattern: scaled only (already repeats, or
// mirroring would flip its letters). still: scaled to `size` px wide. map: square, `size` px (PBR, already seamless).
const JOBS = [
  ['6aad3c64cdc19a15478600dd60d3b38e.jpg', 'possessed/flesh-holes.webp', 'pattern', 640],
  ['3c6dc89e54b4fccf1c9b54493437e7c8.jpg', 'possessed/holes-static.webp', 'pattern', 461],
  ['17049b7ac86e8b29ac4bf5f83375082f.jpg', 'possessed/eyes-dark.webp', 'pattern', 520],
  ['14e78b171715f45dbc88ee3f0057fe5c.jpg', 'possessed/cells.webp', 'tile', 512],
  ['0f7f7fe0ed7f9443259274c3ed3f7271.jpg', 'possessed/veins.webp', 'tile', 512],
  ['72b1018b5dd52574601ecb0870fe937c.jpg', 'possessed/rot-red.webp', 'tile', 512],
  ['68db01e427c852f5a1b4d29982e3b67a.jpg', 'possessed/rot-ruin.webp', 'tile', 512],
  ['bfd74eb0f8b6186c1c40209b5cf21117.jpg', 'possessed/rot-grid.webp', 'tile', 512],
  ['b0446dcddd0af380085f1fe62c153c10.jpg', 'possessed/rot-burn.webp', 'tile', 512],
  ['1c1d9517ac4ea6425b8897a4fe5d8bc9.jpg', 'possessed/nerve.webp', 'tile', 512],
  ['others_0001_color_1k.jpg', 'possessed/flesh.webp', 'map', 512],
  // The second pack.
  ['97392d04a0303a8254286130e1ee6927.jpg', 'possessed/smear.webp', 'tile', 512],
  ['713e64c3ef1cbe5eb43407ce4b2a72de.jpg', 'possessed/rust-wall.webp', 'tile', 512],
  ['e04e0c669ec4b40d64a21072f686f73e.jpg', 'possessed/rust-blood.webp', 'tile', 512],
  ['303fb5a7812eeacf6730f0cfbb08c1cf.jpg', 'possessed/glitch.webp', 'tile', 512],
  ['40dc92c1b1e019deaa34d19a2d0a9292.jpg', 'possessed/faces-wall.webp', 'tile', 512],
  ['8fdc4c0e08c4d48eec77c295ea1fd2f4.jpg', 'possessed/clawing.webp', 'tile', 512],
  ['70e612fb76abf4711ce4548b280ac271.jpg', 'possessed/glyphs.webp', 'pattern', 512],
  ['d661e6aecd3882da1aa9ee4326c0e28e.jpg', 'possessed/dos.webp', 'pattern', 480],
  ['839ed38c995725d89add47939f6f73ff.jpg', 'possessed/help.webp', 'pattern', 432],
  ['96eb1c24834d897703c425a9faa2cec1.jpg', 'possessed/question.webp', 'pattern', 360],
  // Stills: "now playing" frames, the end screens, the flesh world's skies.
  ['7bcc95ce1887f581b47dde9402d8f312.jpg', 'possessed/still-player.webp', 'still', 480],
  ['ff45529d88d146c81408294db6a81fcc.jpg', 'possessed/still-eyes.webp', 'still', 480],
  ['1fc2edd3bd914e84709679d716ad68f8.jpg', 'possessed/still-mouth.webp', 'still', 480],
  ['6ec6b7937d6364197247baed7e84f6b0.jpg', 'possessed/still-face.webp', 'still', 480],
  ['f2a3a4a87f766ce8069d8e8a86d82916.jpg', 'possessed/still-rot.webp', 'still', 640],
  ['08e09b8bf6290feaee8a3577c0b398ef.jpg', 'possessed/sky-corridor.webp', 'still', 512],
  ['5bdbd461d32d77a5d672c5a3487fc2f9.jpg', 'possessed/sky-graveyard.webp', 'still', 512],
  ['fddc85e13233942258de6c740ae5bfce.jpg', 'possessed/sky-church.webp', 'still', 512],
  ['e36071ce9aa6895762a034a010a8258b.jpg', 'possessed/still-scream.webp', 'still', 480],
  ['d5e07e53bb163fba7a845d3cd333b603.jpg', 'possessed/still-blood-eyes.webp', 'still', 560],
  ['b38281667aa03985fa181806d49033b9.jpg', 'possessed/still-letter-eye.webp', 'still', 560],
  ['55d541565a678502a836dba723768530.jpg', 'possessed/still-skull.webp', 'still', 560],
  // The flesh world's material (the 6 MB normal map becomes ~100 KB).
  ['others_0001_normal_opengl_1k.png', 'possessed/flesh-normal.webp', 'map', 512],
  ['others_0001_roughness_1k.jpg', 'possessed/flesh-rough.webp', 'map', 256],
  ['others_0001_ao_1k.jpg', 'possessed/flesh-ao.webp', 'map', 256],
  ['others_0001_height_1k.png', 'possessed/flesh-height.webp', 'map', 256],
  // Gulag Games (gulaggames.com), Daniel's brother's studio.
  ['redirect.jpg', 'ads/gulag-box.webp', 'still', 480],
  ['redirect.webp', 'ads/gulag-wide.webp', 'still', 728],
  ['redirect (2).webp', 'ads/gulag-wings.webp', 'still', 640],
]

const browser = await chromium.launch()
const page = await browser.newPage()
for (const [src, out, mode, size] of JOBS) {
  const type = src.endsWith('.png') ? 'image/png' : src.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
  const dataUrl = `data:${type};base64,${readFileSync(ME(src)).toString('base64')}`
  const jpeg = await page.evaluate(
    async ({ dataUrl, mode, size }) => {
      const img = new Image()
      img.src = dataUrl
      await img.decode()
      const c = document.createElement('canvas')
      const g = c.getContext('2d')
      g.imageSmoothingQuality = 'high'
      if (mode === 'tile') {
        // Half a tile from the picture (aspect kept), then its mirror images around it.
        const half = size / 2
        const s = half / Math.min(img.naturalWidth, img.naturalHeight)
        const w = Math.round(img.naturalWidth * s)
        const h = Math.round(img.naturalHeight * s)
        const tw = Math.min(w, half)
        const th = Math.min(h, half)
        c.width = tw * 2
        c.height = th * 2
        // One quarter cut from the picture, then drawn four times, flipped so every edge meets its own mirror.
        const q = document.createElement('canvas')
        q.width = tw
        q.height = th
        q.getContext('2d').drawImage(img, 0, 0, w, h)
        for (const [fx, fy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
          g.save()
          g.translate(fx === 1 ? 0 : tw * 2, fy === 1 ? 0 : th * 2)
          g.scale(fx, fy)
          g.drawImage(q, 0, 0)
          g.restore()
        }
      } else {
        const w = mode === 'map' ? size : Math.min(size, img.naturalWidth)
        const h = mode === 'map' ? size : Math.round((img.naturalHeight * w) / img.naturalWidth)
        c.width = w
        c.height = h
        g.drawImage(img, 0, 0, w, h)
      }
      return c.toDataURL('image/webp', 0.8)
    },
    { dataUrl, mode, size },
  )
  const file = resolve(ROOT, 'public', out)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, Buffer.from(jpeg.split(',')[1], 'base64'))
  // An older .jpg of the same picture (before these were WebP) goes.
  rmSync(file.replace(/\.webp$/, '.jpg'), { force: true })
  console.log(`${out.padEnd(32)} ${Math.round(Buffer.byteLength(jpeg.split(',')[1], 'base64') / 1024)} KB`)
}
await browser.close()
