import { expect, test, type Locator, type Page } from '@playwright/test'

const ROUTES = ['/', '/dealership', '/shrine/segfault', '/shrine/kettle', '/shrine/chiikawa', '/guestbook', '/under-construction', '/you-won', '/checkout', '/leave', '/scan', '/casino', '/survey', '/work-from-home', '/arcade', '/desktop', '/radio', '/oracle', '/blinkie-maker', '/stickers', '/popnuke', '/settings', '/boring']

/** Skip the enter gate (sessionStorage) and collect real errors, ignoring 404s for not-yet-supplied images. */
async function prepare(page: Page, { skipGate = true, virus = false, pet = false } = {}) {
  // Melly opens top-right over whatever is there; tuck her away except in her own test.
  if (!pet) await page.addInitScript(() => localStorage.getItem('petMinimised') ?? localStorage.setItem('petMinimised', 'true'))
  // The virus alert turns up 25s in; keep it out of every test but its own.
  if (!virus) await page.addInitScript(() => sessionStorage.setItem('virusAlertSeen', 'true'))
  // Melly lives on gify.pet; keep the tests off the real third-party site.
  await page.route('https://gify.pet/**', (r) => r.fulfill({ contentType: 'text/html', body: '<p>Melly</p>' }))
  if (skipGate) await page.addInitScript(() => sessionStorage.setItem('entered', 'true'))
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`console: ${m.text()}`)
  })
  return errors
}

/** Windows pop in with a short scale animation; measure them only once it has finished. */
const settled = (l: Locator) => l.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)))

/**
 * How far content pokes past the device width. Lifts the root `overflow-x: clip` first (it would hide
 * overflow from scrollWidth) and compares to the configured viewport, because mobile emulation
 * zooms out to fit wide content and inflates innerWidth.
 */
async function horizontalOverflow(page: Page) {
  const width = page.viewportSize()!.width
  return page.evaluate((w) => {
    const root = document.documentElement
    root.style.overflowX = document.body.style.overflowX = 'visible'
    const over = Math.max(root.scrollWidth, document.body.scrollWidth) - w
    root.style.overflowX = document.body.style.overflowX = ''
    return over + (window.innerWidth - w)
  }, width)
}

test('enter gate leads into the collage', async ({ page }) => {
  const errors = await prepare(page, { skipGate: false })
  await page.goto('/')
  const gate = page.getByRole('dialog', { name: 'Enter the site' })
  await expect(gate).toBeVisible()
  await gate.getByRole('button').click()
  await expect(gate).toBeHidden()
  await expect(page.getByTestId('mute')).toBeVisible()
  await expect(page.locator('[data-band="coding"]')).toBeAttached()
  expect(errors).toEqual([])
})

for (const route of ROUTES) {
  test(`${route} loads cleanly with no horizontal scroll`, async ({ page }, info) => {
    const errors = await prepare(page)
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)
    expect(errors).toEqual([])
    const name = route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')
    await page.screenshot({ path: `test-results/shots/${info.project.name}/${name}.png`, fullPage: true })
  })
}

test('a hard reload lands back on the enter gate at home', async ({ page }) => {
  await prepare(page)
  await page.goto('/shrine/segfault')
  await expect(page.getByTestId('shrine')).toBeVisible()
  await page.reload()
  await expect(page).toHaveURL(/\/$/)
  const gate = page.getByRole('dialog', { name: 'Enter the site' })
  await expect(gate).toBeVisible()
  await gate.getByRole('button').click()
  await expect(page.getByTestId('mute')).toBeVisible()
})

test('home unlocks audio on first click even if the gate was skipped', async ({ page }) => {
  await prepare(page)
  await page.goto('/')
  await expect(page.getByTestId('mute')).toHaveCount(0)
  await page.locator('[data-band="header"]').click({ position: { x: 5, y: 5 } })
  await expect(page.getByTestId('mute')).toBeVisible()
})

test('music survives a trip through the /boring site map', async ({ page }) => {
  await prepare(page, { skipGate: false })
  await page.goto('/')
  await page.getByRole('dialog', { name: 'Enter the site' }).getByRole('button').click()
  await page.getByRole('link', { name: 'List Sites' }).click()
  await expect(page.getByTestId('boring')).toBeVisible()
  await expect(page.getByTestId('mute')).toHaveCount(0)
  await expect(page.getByTestId('mini-player')).toHaveCount(0)
  await page.getByTestId('boring').getByRole('link', { name: '/casino', exact: true }).click()
  await expect(page.getByTestId('casino')).toBeVisible()
  // Still unlocked: no click needed to bring the audio controls back.
  await expect(page.getByTestId('mute')).toBeVisible()
  await expect(page.getByTestId('mini-player')).toBeVisible()
  expect(await page.evaluate(() => sessionStorage.getItem('entered'))).toBe('true')
})

test('the floating player changes the song on non-home pages', async ({ page }) => {
  await prepare(page)
  await page.goto('/')
  await page.locator('[data-band="header"]').click({ position: { x: 5, y: 5 } })
  await expect(page.getByTestId('mini-player')).toHaveCount(0)
  await page.getByRole('link', { name: 'List Sites' }).click()
  await page.getByTestId('boring').getByRole('link', { name: '/work-from-home', exact: true }).click()
  const player = page.getByTestId('mini-player')
  await expect(player).toBeVisible()
  // Work-from-home's theme song.
  await expect(player.getByTestId('now-playing')).toContainText('Elevator (Going Down)')
  await player.getByRole('button', { name: 'Next track' }).click()
  await expect(player.getByTestId('now-playing')).toContainText('Nightcore Daniel')
  // Back past the first track wraps round to the last one (whatever that is: dropped-in MP3s join the end).
  for (let n = 0; n < 4; n++) await player.getByRole('button', { name: 'Previous track' }).click()
  await expect(player.getByTestId('now-playing')).not.toContainText('Nightcore Daniel')
  const [, number, last] = (await player.getByTestId('now-playing').textContent())!.match(/(\d+)\. DANIEL — (.+?) \*\*\*/)!
  expect(Number(number)).toBeGreaterThan(4)
  await player.getByRole('button', { name: 'Minimise player' }).click()
  await expect(player.getByTestId('now-playing')).toHaveCount(0)
  await expect(player).toContainText(last)
})

test('hovering a track in the music list never shakes it (no jiggle, no sideways overflow)', async ({ page }) => {
  const { width = 1000, height = 1000 } = page.viewportSize() ?? {}
  test.skip(width < 640 || height <= 500, 'the floating track list is hidden on phones')
  await prepare(page)
  await page.goto('/casino')
  await page.locator('[data-testid="casino"]').click({ position: { x: 5, y: 5 } }) // unlock audio so the player shows
  const list = page.getByTestId('mini-player').locator('ul')
  const track = list.getByRole('button').nth(3)
  const box = (await track.boundingBox())!
  await page.mouse.move(box.x + box.width - 3, box.y + box.height - 2) // the edge, where the loop used to start
  await expect(track).not.toHaveCSS('animation-name', 'jiggle')
  const overflowed = await list.evaluate(
    (ul) =>
      new Promise<boolean>((done) => {
        let n = 0
        let seen = false
        const tick = () => {
          seen ||= ul.scrollWidth > ul.clientWidth
          if (++n < 30) requestAnimationFrame(tick)
          else done(seen)
        }
        requestAnimationFrame(tick)
      }),
  )
  expect(overflowed).toBe(false)
})

test('each page plays its own song unless the song is pinned', async ({ page }) => {
  await prepare(page)
  await page.goto('/')
  await page.locator('[data-band="header"]').click({ position: { x: 5, y: 5 } })
  const webring = page.getByRole('navigation', { name: 'Webring' })
  await webring.getByRole('link', { name: 'Next »' }).click()
  await expect(page.getByTestId('dealership')).toBeVisible()
  const player = page.getByTestId('mini-player')
  await expect(player.getByTestId('now-playing')).toContainText('Dealership Jingle')
  await webring.getByRole('link', { name: 'Next »' }).click()
  await expect(player.getByTestId('now-playing')).not.toContainText('Dealership Jingle')
  await player.getByRole('button', { name: 'Lock song' }).click()
  await expect(player.getByRole('button', { name: 'Lock song' })).toHaveAttribute('aria-pressed', 'true')
  const pinned = (await player.getByTestId('now-playing').textContent())!
  await webring.getByRole('link', { name: 'Next »' }).click()
  await expect(player.getByTestId('now-playing')).toHaveText(pinned)
})

test("Melly's window minimises and stays minimised across pages and visits", async ({ page }) => {
  await prepare(page, { pet: true })
  await page.goto('/dealership')
  const pet = page.getByTestId('pet-window')
  // Phones start with Melly minimised; open her first there.
  const restore = pet.getByRole('button', { name: 'Restore Melly.exe' })
  await settled(pet)
  if (await restore.isVisible()) await restore.click()
  await expect(pet.frameLocator('iframe').getByText('Melly')).toBeVisible()
  await settled(pet)
  await pet.getByRole('button', { name: 'Minimise Melly.exe' }).click()
  await expect(pet.locator('iframe')).toBeHidden()
  await page.getByRole('navigation', { name: 'Webring' }).getByRole('link', { name: 'Next »' }).click()
  await expect(pet.locator('iframe')).toBeHidden()
  await page.goto('/casino')
  await expect(pet.getByRole('button', { name: 'Restore Melly.exe' })).toBeVisible()
  await settled(pet)
  await pet.getByRole('button', { name: 'Restore Melly.exe' }).click()
  await expect(pet.frameLocator('iframe').getByText('Melly')).toBeVisible()
})

test('a found sticker shows up in the sticker book', async ({ page }) => {
  await prepare(page)
  await page.goto('/dealership')
  await page.getByTestId('hidden-sticker').click({ force: true })
  await expect(page.getByRole('status').filter({ hasText: 'STICKER GET!' })).toBeVisible()
  await page.goto('/stickers')
  await expect(page.getByTestId('sticker-count')).toHaveText('1 / 12 FOUND')
  await expect(page.getByAltText('Cupcake')).toBeVisible()
})

test('the spinning Daniel keeps spinning even when the OS asks for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await prepare(page)
  await page.goto('/')
  const head = page.locator('[data-band="header"] img.animate-spin-y').first()
  await expect(head).toHaveCSS('animation-iteration-count', 'infinite')
  await expect(head).toHaveCSS('animation-name', 'spin-y')
})

test('the dealership always has the bouncing TRUST ME tower ad, even with reduce-motion on', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await prepare(page)
  await page.goto('/dealership')
  const ad = page.getByRole('complementary', { name: 'Ad tower' }).getByText('YOU CAN TRUST ME, I AM DANIEL!').locator('xpath=..')
  await expect(ad).toHaveCount(1)
  await expect(ad.locator('img')).toHaveAttribute('src', '/me/full-body-cutout.png')
  await expect(ad.getByText('TRUST »')).toBeVisible()
  const anim = await ad.evaluate((el) => [el.querySelector('img')!, el.lastElementChild!].map((e) => `${getComputedStyle(e).animationName} ${getComputedStyle(e).animationIterationCount}`))
  expect(anim).toEqual(['boing infinite', 'pulse-scale infinite'])
})

test('the blinkie maker downloads a real animated GIF', async ({ page }) => {
  await prepare(page)
  await page.goto('/blinkie-maker')
  await page.getByLabel('Text', { exact: true }).fill('E2E RULZ')
  const button = page.getByRole('button', { name: /DOWNLOAD/ })
  await expect(button).toBeEnabled()
  const [download] = await Promise.all([page.waitForEvent('download'), button.click()])
  expect(download.suggestedFilename()).toBe('e2e-rulz-150x20.gif')
  const chunks: Buffer[] = []
  for await (const c of (await download.createReadStream())!) chunks.push(c as Buffer)
  const gif = Buffer.concat(chunks)
  expect(gif.subarray(0, 6).toString('latin1')).toBe('GIF89a')
  expect(gif.length).toBeGreaterThan(200)
})

test('the aim trainer counts a hit', async ({ page }) => {
  await prepare(page)
  await page.goto('/arcade')
  await page.getByRole('button', { name: 'PRESS START' }).click()
  // The target shrinks every frame, so dispatch instead of waiting for it to hold still.
  await page.getByTestId('aim-target').dispatchEvent('pointerdown')
  await expect(page.getByText('HITS 1')).toBeVisible()
})

test("the desktop's notepad remembers what you typed, and windows drag", async ({ page }) => {
  await prepare(page)
  await page.goto('/desktop')
  await page.getByRole('list', { name: 'Desktop icons' }).getByRole('button', { name: 'diary.txt' }).click()
  const notepad = page.getByTestId('window-notepad')
  await notepad.getByLabel('Notepad diary').fill('secret e2e diary')
  await settled(notepad)
  // Typing scrolled the page; back to the top so the title bar isn't tucked under the sticky taskbar.
  await page.evaluate(() => window.scrollTo(0, 0))
  const bar = notepad.getByText('diary.txt - Notepad')
  const before = (await notepad.boundingBox())!
  const handle = (await bar.boundingBox())!
  await page.mouse.move(handle.x + 40, handle.y + 5)
  await page.mouse.down()
  await page.mouse.move(handle.x + 100, handle.y + 65, { steps: 5 })
  await page.mouse.up()
  const after = (await notepad.boundingBox())!
  expect(after.x - before.x).toBeGreaterThan(30)
  await page.goto('/desktop')
  await page.getByRole('list', { name: 'Desktop icons' }).getByRole('button', { name: 'diary.txt' }).click()
  await expect(page.getByTestId('window-notepad').getByLabel('Notepad diary')).toHaveValue('secret e2e diary')
})

test('the Albanian virus alert appears a while in and any button closes it', async ({ page }) => {
  await page.clock.install()
  await prepare(page, { virus: true })
  await page.goto('/casino')
  await expect(page.getByTestId('virus-alert')).toHaveCount(0)
  await page.clock.fastForward(26_000)
  const alert = page.getByRole('alertdialog', { name: 'Virus Alert' })
  await expect(alert).toBeVisible()
  await expect(alert).toContainText('smash your computer with a hammer')
  await settled(alert)
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)
  // It can be dragged around by its title bar.
  const before = (await alert.boundingBox())!
  const bar = (await alert.getByTestId('virus-alert-titlebar').boundingBox())!
  await page.mouse.move(bar.x + 30, bar.y + bar.height / 2)
  await page.mouse.down()
  await page.mouse.move(bar.x + 30, bar.y + bar.height / 2 + 90, { steps: 5 })
  await page.mouse.up()
  const after = (await alert.boundingBox())!
  expect(after.y - before.y).toBeGreaterThan(60)
  expect(Math.abs(after.x - before.x)).toBeLessThan(2)
  await alert.getByRole('button', { name: 'No' }).click()
  await expect(alert).toBeHidden()
  // Once per visit.
  await page.clock.fastForward(60_000)
  await expect(alert).toBeHidden()
})

/** How many pixels a canvas has actually drawn (alpha > 0). */
const drawnPixels = (l: Locator) =>
  l.evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data
    let n = 0
    for (let i = 3; i < d.length; i += 4) if (d[i]) n++
    return n
  })

test('3D: a TextureTown world on /oracle, objects on /casino, nothing on Home', async ({ page }) => {
  const errors = await prepare(page)
  await page.goto('/oracle')
  const world = page.getByTestId('world-3d')
  await expect(world).toHaveCount(1)
  await expect.poll(() => drawnPixels(world), { timeout: 10_000 }).toBeGreaterThan(1000)
  await expect(page.locator('html')).toHaveAttribute('data-world', 'mystic')

  await page.goto('/casino')
  await expect(page.getByTestId('object-3d')).not.toHaveCount(0)
  await expect.poll(() => drawnPixels(page.getByTestId('object-3d').first()), { timeout: 10_000 }).toBeGreaterThan(50)
  await expect(page.getByTestId('world-3d')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveAttribute('data-world')

  await page.goto('/')
  await expect(page.getByTestId('home')).toBeVisible()
  await expect(page.getByTestId('object-3d')).toHaveCount(0)
  expect(errors).toEqual([])
})

// Every page except Home. (Exact per-page counts are pinned by the unit tests against the content itself.)
const OBJECT_PAGES = [
  '/dealership', '/guestbook', '/under-construction', '/you-won', '/checkout', '/scan', '/casino', '/survey', '/work-from-home',
  '/arcade', '/desktop', '/radio', '/oracle', '/blinkie-maker', '/stickers', '/popnuke', '/settings', '/leave', '/this/does/not/exist',
  '/shrine/chiikawa', '/shrine/battlestation', '/shrine/peripherals', '/shrine/segfault', '/shrine/norminette',
  '/shrine/push-swap', '/shrine/kettle', '/shrine/horses', '/shrine/teeth',
]

test('every page except Home has 3-5 drawn 3D objects (just the 1-2 drifters on phones), with no sideways scroll', async ({ page }, info) => {
  test.setTimeout(180_000)
  const errors = await prepare(page)
  const phone = (page.viewportSize()?.width ?? 1000) < 640
  // A rare legendary may turn up too (5% per page); they always glow, so leave them out of the counts.
  const ordinary = '[data-testid="object-3d"]:not(.animate-legend)'
  for (const path of OBJECT_PAGES) {
    await page.goto(path)
    const objects = page.locator(ordinary)
    await expect.poll(() => objects.count(), { message: `${path} on ${info.project.name}` }).toBeGreaterThanOrEqual(phone ? 1 : 3)
    const n = await objects.count()
    if (phone) {
      expect(n, path).toBeLessThanOrEqual(2)
      await expect(page.getByTestId('objects-page').locator(ordinary), `${path}: no margin objects on phones`).toHaveCount(0)
    } else expect(n, path).toBeLessThanOrEqual(5)
    await expect.poll(() => drawnPixels(objects.first()), { timeout: 10_000, message: path }).toBeGreaterThan(20)
    expect(await horizontalOverflow(page), path).toBeLessThanOrEqual(0)
  }
  expect(errors).toEqual([])
})

/** Objects showing right now that are off-screen, or have something (content, text, floating UI) over them. */
const hiddenObjects = (page: Page) =>
  page.evaluate(() => {
    // Background = nothing painted there: a transparent box, and not on top of an actual line of its text.
    const background = (e: Element | null, x: number, y: number) => {
      if (!e || e === document.documentElement || e === document.body || e.tagName === 'MAIN' || e.closest('[data-testid^="objects-"]')) return true
      const cs = getComputedStyle(e)
      if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none') return false
      if (/^(IMG|CANVAS|VIDEO|IFRAME|svg|BUTTON|INPUT|TEXTAREA|SELECT)$/.test(e.tagName)) return false
      return ![...e.childNodes].some((n) => {
        if (n.nodeType !== 3 || !n.textContent?.trim()) return false
        const range = document.createRange()
        range.selectNodeContents(n)
        return [...range.getClientRects()].some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)
      })
    }
    const out: string[] = []
    for (const c of document.querySelectorAll<HTMLCanvasElement>('[data-testid="object-3d"]')) {
      if (c.style.opacity === '0') continue
      const r = c.getBoundingClientRect()
      const drifting = !!c.closest('[data-testid="objects-screen"]')
      if (drifting ? r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1 : r.left < -1 || r.right > document.documentElement.clientWidth + 1)
        out.push(`${c.dataset.object} out of the window`)
      for (const fx of [0.3, 0.5, 0.7])
        for (const fy of [0.3, 0.5, 0.7]) {
          const x = r.left + r.width * fx
          const y = r.top + r.height * fy
          if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue
          const e = document.elementFromPoint(x, y)
          if (!background(e, x, y)) {
            out.push(`${c.dataset.object} covered by <${e?.tagName.toLowerCase()} ${String(e?.className).slice(0, 40)}>`)
            break
          }
        }
    }
    return [...new Set(out)]
  })

test('3D objects are never hidden behind content or floating UI, or outside the window, even while scrolling', async ({ page }) => {
  test.setTimeout(240_000)
  await prepare(page)
  const problems: string[] = []
  for (const path of OBJECT_PAGES) {
    await page.goto(path)
    await page.locator('[data-testid="object-3d"]').first().waitFor()
    for (const scroll of [0, 0.6, 1.2]) {
      await page.evaluate((k) => window.scrollTo(0, innerHeight * k), scroll)
      await page.waitForTimeout(700) // long enough for a drifter or dodging anchor to slip clear
      // Something that only just popped up (an ambush pop-up, a window) gets a moment for objects to dodge it.
      const first = await hiddenObjects(page)
      if (first.length) await page.waitForTimeout(600)
      for (const p of first.length ? await hiddenObjects(page) : []) problems.push(`${path} @${scroll}: ${p}`)
    }
  }
  expect(problems).toEqual([])
})

/**
 * Clicks a 3D object once it's in sight. Objects duck out of sight when a window covers them with nowhere to
 * step aside to (and hidden objects aren't clickable), so wait for it to be showing first.
 */
async function clickObject(page: Page, obj: Locator) {
  await expect(obj).not.toHaveCSS('opacity', '0', { timeout: 10_000 })
  const box = (await obj.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

/**
 * These tests want the margins clear: the expanded player covers much of a short screen's margin, and a big GIF
 * of confetti thrown on the wrong spot can leave an object nowhere to step aside to.
 */
const clearMargins = (page: Page) =>
  page.addInitScript(() => {
    localStorage.setItem('playerMinimised', 'true')
    addEventListener('DOMContentLoaded', () => document.head.append(Object.assign(document.createElement('style'), { textContent: '[data-testid="gif-confetti"] { display: none }' })))
  })

test('clicking an object in the margin opens its properties window, not whatever is underneath', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1000) < 640, 'phones only get drifters')
  await prepare(page)
  await clearMargins(page)
  await page.goto('/casino')
  const die = page.locator('[data-object="dice-a"]')
  await expect.poll(() => drawnPixels(die), { timeout: 10_000 }).toBeGreaterThan(20)
  await clickObject(page, die)
  const win = page.getByTestId('object-window')
  await expect(win).toBeVisible()
  await expect(win).toContainText('Lucky Die')
  await expect(win).toContainText('Made of:')
  // The Lucky Die is excitable, but nobody is ever told that.
  await expect(win).not.toContainText(/excitable|personality/i)
  await expect.poll(() => drawnPixels(win.getByTestId('object-viewer')), { timeout: 10_000 }).toBeGreaterThan(200)
  await expect(page).toHaveURL(/\/casino$/)
  await win.getByRole('button', { name: /Close/ }).click()
  await expect(win).toHaveCount(0)
})

test('the crash screen keeps its objects, and clicking one does not reboot you somewhere else', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1000) < 640, 'phones only get drifters')
  await prepare(page)
  await clearMargins(page)
  await page.goto('/this/does/not/exist')
  await expect(page.getByTestId('bsod')).toBeVisible()
  // The crash screen still covers the site's floating chat button.
  const chat = page.getByRole('button', { name: /LIVE CHAT/ })
  const cb = (await chat.boundingBox())!
  expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('[data-testid="bsod"]') !== null, [cb.x + 5, cb.y + 5])).toBe(true)
  // Whichever crashed object has room to show at this screen size.
  // (One that's been showing for a moment: in its first frame an object hasn't yet found out it's cornered.)
  const showing = () => page.locator('[data-testid="object-3d"]:not([style*="opacity: 0"])').evaluateAll((cs) => cs.map((c) => c.dataset.object!))
  let id: string | undefined
  await expect.poll(async () => {
    const before = await showing()
    await page.waitForTimeout(400)
    id = (await showing()).find((o) => before.includes(o))
    return id
  }, { timeout: 15_000 }).toBeTruthy()
  const shown = page.locator(`[data-object="${id}"]`)
  await expect.poll(() => drawnPixels(shown), { timeout: 10_000 }).toBeGreaterThan(20)
  await clickObject(page, shown)
  await expect(page.getByTestId('object-window')).toBeVisible()
  await expect(page).toHaveURL(/does\/not\/exist$/)
})

test('a summoned legendary unlocks its page; unseen ones stay sealed', async ({ page }) => {
  // Objects only ever show where there's free space; a 375px-tall landscape phone has none for a goose.
  test.skip((page.viewportSize()?.height ?? 1000) < 400, 'no free space on a landscape phone')
  await prepare(page)
  await page.goto('/legendary/beef')
  await expect(page.getByTestId('sealed')).toBeVisible()
  await page.goto('/scan?summon=goose')
  const goose = page.locator('[data-object="goose"]')
  await expect.poll(() => drawnPixels(goose), { timeout: 10_000 }).toBeGreaterThan(20)
  await expect(goose).not.toHaveCSS('opacity', '0') // it has found somewhere visible to be
  // It drifts; catch it where it is right now.
  const box = (await goose.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  const win = page.getByTestId('object-window')
  await expect(win).toContainText('LEGENDARY')
  await win.getByRole('link', { name: /Visit its page/ }).click()
  await expect(page).toHaveURL(/\/legendary\/goose$/)
  await expect(page.getByTestId('first-seen')).not.toBeEmpty()
  await expect.poll(() => drawnPixels(page.getByTestId('object-viewer')), { timeout: 10_000 }).toBeGreaterThan(200)
})

test('the three new shrine worlds draw', async ({ page }) => {
  await prepare(page)
  for (const [path, id] of [['/shrine/horses', 'meadow'], ['/shrine/chiikawa', 'painted'], ['/shrine/battlestation', 'space']]) {
    await page.goto(path)
    await expect.poll(() => drawnPixels(page.getByTestId('world-3d')), { timeout: 10_000, message: path }).toBeGreaterThan(1000)
    await expect(page.locator('html')).toHaveAttribute('data-world', id)
  }
})

test('ads breathe instead of shaking, and nothing in a popup jiggles', async ({ page }) => {
  await prepare(page)
  await page.goto('/')
  const banner = page.locator('[data-ad]').filter({ has: page.locator('.animate-breathe') }).first()
  await banner.scrollIntoViewIfNeeded()
  await expect(banner.locator('.animate-breathe').first()).toHaveCSS('animation-name', 'breathe')
  await banner.hover()
  await expect(banner).not.toHaveCSS('animation-name', 'jiggle')

  await page.getByRole('button', { name: /CALL ME/ }).click()
  const popup = page.getByTestId('popup')
  await settled(popup)
  const close = popup.getByRole('button', { name: 'Close' })
  await close.hover()
  await expect(close).not.toHaveCSS('animation-name', 'jiggle')
})

test('the enter gate floats on a 3D dream world that goes away on entering', async ({ page }) => {
  const errors = await prepare(page, { skipGate: false })
  await page.goto('/')
  const gate = page.getByRole('dialog', { name: 'Enter the site' })
  const dream = gate.getByTestId('world-3d')
  await expect(dream).toHaveCount(1)
  await expect.poll(() => drawnPixels(dream), { timeout: 10_000 }).toBeGreaterThan(1000)
  // The gate's dream must not make the home page's tiles transparent underneath.
  await expect(page.locator('html')).not.toHaveAttribute('data-world')
  await gate.getByRole('button').click()
  await expect(page.getByTestId('world-3d')).toHaveCount(0)
  expect(errors).toEqual([])
})

test("Cyber Town door icons sit above their labels, not on them", async ({ page }) => {
  await prepare(page)
  await page.goto('/')
  const doors = page.getByRole('list', { name: 'Cyber Town' }).getByRole('link')
  await doors.first().scrollIntoViewIfNeeded()
  for (const door of await doors.all()) {
    const icon = (await door.locator('img').nth(1).boundingBox())!
    const label = (await door.locator('span.font-comic').boundingBox())!
    expect(icon.y + icon.height, await door.textContent() ?? '').toBeLessThanOrEqual(label.y + 1)
  }
})

test('Home loads over dial-up the moment you CLICK HERE TO ENTER (not unseen behind the gate)', async ({ page }) => {
  await prepare(page, { skipGate: false })
  await page.goto('/')
  await expect(page.getByTestId('page-load')).toHaveCount(0)
  await page.getByRole('dialog', { name: 'Enter the site' }).getByRole('button').click()
  await expect(page.getByTestId('page-load')).toHaveCSS('animation-name', 'dialup')
  await expect(page.getByTestId('page-load')).toHaveCSS('animation-duration', '1.1s') // a first visit
})

test('the table of contents goes where it says', async ({ page }) => {
  await prepare(page)
  await page.goto('/')
  const toc = page.getByText('TABLE OF CONTENTS').locator('..')
  await toc.getByRole('link', { name: 'Introduction' }).click()
  await expect(page.locator('#welcome')).toBeInViewport()
  await expect(page).toHaveURL(/\/$/) // a scroll, not a navigation
  await toc.getByRole('link', { name: 'Horses' }).click()
  await expect(page).toHaveURL(/\/shrine\/horses$/)
})

test('the music has a volume slider that starts at half, sticks between pages, and unmutes when raised', async ({ page }) => {
  await prepare(page)
  await page.goto('/')
  await page.locator('[data-band="header"]').click({ position: { x: 5, y: 5 } }) // unlock audio
  const jukebox = page.locator('[data-band="destiny"]').getByTestId('volume')
  await expect(jukebox).toHaveValue('50')
  await page.getByTestId('mute').click() // mute
  await jukebox.fill('20')
  await expect(page.getByTestId('mute')).toHaveAttribute('aria-label', 'Mute') // raising it unmuted
  await page.goto('/radio')
  await page.locator('[data-testid="radio"]').click({ position: { x: 5, y: 5 } })
  await expect(page.getByTestId('radio').getByTestId('volume')).toHaveValue('20')
  await expect(page.getByTestId('mini-player').getByTestId('volume')).toHaveValue('20')
})

/** Closes the topmost pop-up, if there is one. Returns whether it did. */
async function closeTopPopup(page: Page) {
  // The newest is on top (older ones may be covered); ones already easing shut don't count.
  const popup = page.locator('[data-testid="popup"]:not([data-closing])').last()
  if (!(await popup.count())) return false
  await settled(popup)
  await popup.getByRole('button', { name: 'Close' }).click()
  return true
}

test('after closing 3 pop-ups, the next one advertises POPNUKE, and both its buttons lead there', async ({ page }) => {
  test.setTimeout(120_000)
  await page.clock.install()
  await prepare(page)
  await page.goto('/casino')
  // Close three pop-ups (multiplying ones spawn more, which is fine), then the next ambush is the ad.
  let ad = false
  let closed = 0
  for (let i = 0; i < 15 && !ad; i++) {
    await page.clock.fastForward(33_000) // the ambush fires every 14–32s
    ad = (await page.getByTestId('popnuke-ad').count()) > 0
    while (!ad && closed < 3 && (await closeTopPopup(page))) closed++
  }
  expect(ad).toBe(true)
  expect(await page.evaluate(() => Number(sessionStorage.getItem('popnukeClosed')))).toBeGreaterThanOrEqual(3)
  await page.getByTestId('popnuke-ad').getByRole('button', { name: /no thanks, I love pop-ups/ }).click()
  await expect(page).toHaveURL(/\/popnuke$/)
})

test('installing POPNUKE really blocks the pop-ups and the virus alert, and uninstalling brings them back at once', async ({ page }) => {
  test.setTimeout(120_000)
  await page.clock.install()
  await prepare(page, { virus: true })
  await page.goto('/popnuke')
  await page.getByTestId('popnuke-install').scrollIntoViewIfNeeded()
  await page.getByTestId('popnuke-install').click()
  const setup = page.getByTestId('popnuke-setup')
  await expect(setup.getByTestId('setup-next')).toBeDisabled()
  await expect(setup.getByTestId('setup-agree')).toBeDisabled() // must read it all first
  await setup.getByTestId('setup-eula').evaluate((el) => {
    el.scrollTop = el.scrollHeight
    el.dispatchEvent(new Event('scroll'))
  })
  await setup.getByTestId('setup-agree').check()
  await setup.getByTestId('setup-next').click()
  // Every tick of the progress bar (and its stall at 99%); stepped, since the bar's timer starts after a render.
  await expect(setup.getByTestId('setup-progress')).toBeVisible()
  await expect.poll(async () => {
    await page.clock.runFor(1_000)
    return setup.getByTestId('setup-finish').count()
  }, { timeout: 30_000 }).toBe(1)
  await setup.getByTestId('setup-finish').click()
  await expect(page.getByTestId('popnuke-badge')).toBeVisible()

  // Two minutes of would-be pop-ups (and the virus alert, due at 25s): nothing gets through.
  await page.goto('/casino')
  // fastForward fires each due timer once per jump, so step through it like the ambush would.
  for (let i = 0; i < 4; i++) await page.clock.fastForward(33_000)
  await expect(page.getByTestId('popup')).toHaveCount(0)
  await expect(page.getByTestId('virus-alert')).toHaveCount(0)
  expect(Number(await page.getByTestId('popnuke-blocked').textContent())).toBeGreaterThanOrEqual(4)

  // Pop-ups you ask for still work.
  await page.goto('/')
  await page.getByRole('button', { name: /CALL ME/ }).click()
  await expect(page.getByTestId('popup')).toHaveCount(1)
  await page.getByTestId('popup').getByRole('button', { name: 'Close' }).click()

  // Uninstall: instant revenge.
  await page.goto('/popnuke')
  await page.getByTestId('popnuke-uninstall').scrollIntoViewIfNeeded()
  await page.getByTestId('popnuke-uninstall').click()
  await page.getByTestId('popnuke-confirm-yes').click()
  await page.clock.fastForward(1_000)
  await expect(page.getByTestId('popup')).toHaveCount(3)
  await expect(page.getByTestId('popup').first()).toContainText('WELCOME BACK')
  await expect(page.getByTestId('popnuke-badge')).toHaveCount(0)
})

test('the POPNUKE demo plays as you scroll', async ({ page }) => {
  await prepare(page)
  await page.goto('/popnuke')
  const hero = page.getByTestId('popnuke-hero-canvas')
  await expect.poll(() => drawnPixels(hero), { timeout: 10_000 }).toBeGreaterThan(1000)
  const look = () => hero.evaluate((c: HTMLCanvasElement) => c.toDataURL().length + ':' + c.toDataURL().slice(-200))
  // Scroll to 10% of the demo (the sticky part runs over height - one screen).
  await page.evaluate(() => window.scrollTo(0, ((document.querySelector('[data-testid="popnuke-hero"]') as HTMLElement).offsetHeight - innerHeight) * 0.1))
  await expect(page.getByTestId('popnuke-frame')).toContainText('FRAME 01')
  const early = await look()
  await page.evaluate(() => window.scrollTo(0, (document.querySelector('[data-testid="popnuke-hero"]') as HTMLElement).offsetHeight - innerHeight))
  await expect(page.getByTestId('popnuke-frame')).toContainText('FRAME 04')
  await expect.poll(look).not.toBe(early)
})

test('unknown routes blue-screen', async ({ page }) => {
  await prepare(page)
  await page.goto('/this/does/not/exist')
  await expect(page.getByTestId('bsod')).toBeVisible()
})

test('business-card popup opens, drags, and closes', async ({ page }) => {
  await prepare(page)
  await page.goto('/')
  await page.getByRole('button', { name: /CALL ME/ }).click()
  const popup = page.getByTestId('popup')
  await expect(popup).toBeVisible()
  await expect(popup.getByRole('link', { name: /boring site/ })).toBeVisible()
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)

  const bar = popup.locator('div').first()
  await settled(popup)
  const before = await popup.boundingBox()
  const box = await bar.boundingBox()
  await page.mouse.move(box!.x + 20, box!.y + box!.height / 2)
  await page.mouse.down()
  await page.mouse.move(box!.x + 20, box!.y + 120, { steps: 5 })
  await page.mouse.up()
  const after = await popup.boundingBox()
  expect(after!.y).toBeGreaterThan(before!.y + 50)

  await popup.getByRole('button', { name: 'Close' }).click()
  await expect(popup).toBeHidden()
})

test('a dodging close button stays clickable and never sends you anywhere', async ({ page }, info) => {
  test.skip(!/desktop|tablet-landscape/.test(info.project.name), 'dodging is mouse-only')
  // Only 1 ambush in 4 is a dodger, so the hunt below is luck: usually a few steps, now and then forty.
  test.setTimeout(180_000)
  await page.clock.install()
  await prepare(page)
  await page.goto('/')
  const dodgers = page.locator('[data-testid="popup"][data-variant="dodge"]:not([data-closing])')
  // Ambush popups pick a random variant; close the others (topmost first: "multiply" ones split into
  // overlapping pairs) and wait for the next until a dodger turns up.
  for (let i = 0; i < 60 && (await dodgers.count()) === 0; i++) {
    const other = page.locator('[data-testid="popup"]:not([data-variant="dodge"]):not([data-closing])').last()
    if (await other.count()) await other.getByRole('button', { name: 'Close' }).click()
    else await page.clock.fastForward(33_000)
  }
  const before = await dodgers.count()
  expect(before).toBeGreaterThan(0)
  const close = dodgers.first().getByRole('button', { name: 'Close' })
  for (let i = 0; i < 3; i++) {
    await page.mouse.move(0, 0)
    await close.hover()
  }
  // Playwright refuses to click an element something else is drawn over, so this also proves nothing covers it.
  await close.click()
  await expect(dodgers).toHaveCount(before - 1)
  expect(new URL(page.url()).pathname).toBe('/')
})

test('/boring is plain and has the real links', async ({ page }) => {
  await prepare(page)
  await page.goto('/boring')
  await expect(page.getByRole('link', { name: /github\.com/ })).toBeVisible()
  await expect(page.getByTestId('chat-toggle')).toHaveCount(0)
  await expect(page.getByTestId('popup')).toHaveCount(0)
})

test('live chat answers', async ({ page }) => {
  await prepare(page)
  await page.goto('/dealership')
  await page.getByTestId('chat-toggle').click()
  await page.getByLabel('Message').fill('how much')
  await page.getByRole('button', { name: 'SEND' }).click()
  await expect(page.getByTestId('typing')).toBeVisible()
  await expect(page.getByTestId('typing')).toBeHidden({ timeout: 6000 })
  await expect(page.getByRole('dialog', { name: 'Live chat' }).locator('p')).toHaveCount(3)
})

test('the taskbar stays stuck to the top, fits the screen, and its buttons go where they say', async ({ page }) => {
  await prepare(page)
  await page.goto('/dealership')
  const bar = page.getByTestId('taskbar')
  await expect(bar).toBeVisible()
  expect(await bar.evaluate((n) => n.scrollWidth - n.clientWidth)).toBeLessThanOrEqual(0)
  await page.evaluate(() => window.scrollTo(0, 1500))
  await expect.poll(async () => (await bar.boundingBox())!.y).toBe(0)
  // First click unlocks the audio; the mute button lives in the tray.
  await bar.getByTestId('tray').click()
  await expect(bar.getByTestId('tray').getByTestId('mute')).toBeVisible()
  await bar.getByRole('link', { name: 'DONATE' }).click()
  await expect(page).toHaveURL(/\/under-construction$/)
  await expect(bar.getByRole('link', { name: 'DONATE' })).toHaveAttribute('aria-current', 'page')
  await bar.getByRole('link', { name: /home$/ }).click() // the logo
  await expect(page).toHaveURL(/\/$/)
})

test('a page loads over dial-up the first time (jerky, status bar, hourglass), then fades in from the cache', async ({ page }) => {
  await prepare(page)
  // Don't wait for every picture: the load is over in about a second.
  await page.goto('/casino', { waitUntil: 'commit' })
  const load = page.getByTestId('page-load')
  await expect(load).toHaveCSS('animation-timing-function', /step-end|steps\(1/)
  await expect(load).toHaveCSS('animation-duration', '1.1s')
  await expect(page.getByTestId('status-bar')).toContainText(/Contacting host|Waiting for reply|Opening page \/casino/)
  await expect(page.locator('html')).toHaveAttribute('data-loading', '')
  expect(await page.evaluate(() => getComputedStyle(document.body).cursor)).toBe('progress')
  // Then it's done, and gets out of the way.
  await expect(load).toHaveCount(0)
  await expect(page.getByTestId('status-bar')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveAttribute('data-loading')
  // Somewhere new loads over dial-up again…
  await page.getByTestId('taskbar').getByRole('link', { name: 'Guestbook' }).click()
  await expect(load).toHaveCSS('animation-duration', '1.1s')
  await expect(load).toHaveCount(0)
  // …but back somewhere already seen, it's cached: no blank page, status bar or hourglass, just a fade.
  await page.evaluate(() => {
    const w = window as unknown as { saw: string[] }
    w.saw = []
    new MutationObserver(() => {
      if (document.querySelector('[data-testid="page-load"], [data-testid="status-bar"]')) w.saw.push('dial-up')
      if ('loading' in document.documentElement.dataset) w.saw.push('loading')
      if (document.querySelector('main')?.getAnimations().some((a) => (a as Animation & { effect: KeyframeEffect }).effect?.getKeyframes().some((k) => k.opacity !== undefined))) w.saw.push('fade')
    }).observe(document.body, { childList: true, subtree: true, attributes: true })
  })
  await page.goBack()
  await expect(page).toHaveURL(/\/casino$/)
  await expect.poll(() => page.evaluate(() => (window as unknown as { saw: string[] }).saw)).toContain('fade')
  const saw = await page.evaluate(() => (window as unknown as { saw: string[] }).saw)
  expect(saw).not.toContain('dial-up')
  expect(saw).not.toContain('loading')
})

test('scrolling is smooth: no repaint lag, and pictures scrolled to after the load show whole', async ({ page }) => {
  await prepare(page)
  await page.goto('/dealership')
  await expect(page.getByTestId('page-load')).toHaveCount(0)
  await expect(page.getByTestId('repaint-lag')).toHaveCount(0)
  // A picture far down the page whose file hasn't been shown anywhere yet: scrolled to, it never "downloads".
  await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('main img')]
    const seen = new Set(imgs.filter((i) => i.getBoundingClientRect().top < innerHeight * 1.5).map((i) => i.getAttribute('src')))
    imgs.find((i) => i.getBoundingClientRect().top > innerHeight * 2 && !seen.has(i.getAttribute('src')))?.setAttribute('data-e2e', 'fresh')
  })
  const fresh = page.locator('[data-e2e="fresh"]')
  await fresh.evaluate((img) => img.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(300)
  expect(await fresh.evaluate((img) => img.getAnimations().length + (img as HTMLElement).style.maskImage.length)).toBe(0)
})

test('windows ease shut before they go', async ({ page }) => {
  await page.clock.install()
  await prepare(page, { virus: true })
  await page.goto('/casino')
  await page.clock.fastForward(26_000)
  const alert = page.getByRole('alertdialog', { name: 'Virus Alert' })
  await expect(alert).toBeVisible()
  await alert.getByRole('button', { name: 'No' }).click()
  await expect(alert).toHaveCSS('animation-name', 'pop-out')
  await expect(alert).toHaveCount(0)
})

/** Opens a Control Panel applet, lets `change` fiddle with it, and presses OK. */
async function inApplet(page: Page, name: string, change: (dialog: Locator) => Promise<unknown>) {
  await page.getByRole('button', { name: `${name} Properties` }).click()
  const dialog = page.getByTestId('applet')
  await change(dialog)
  await dialog.getByRole('button', { name: 'OK' }).click()
  await expect(dialog).toHaveCount(0)
}

test('the Control Panel changes the whole site, and remembers', async ({ page }) => {
  await prepare(page)
  await page.goto('/settings')
  await inApplet(page, 'Display', async (d) => {
    await d.getByRole('radio', { name: /Vaporwave/ }).check()
    await d.getByRole('checkbox', { name: /Comic Sans Mode/ }).check()
  })
  await inApplet(page, 'Mouse', (d) => d.getByRole('radio', { name: 'Busy (hourglass)' }).check())
  await inApplet(page, 'Sounds', (d) => d.getByRole('slider', { name: 'Music' }).fill('40'))
  await inApplet(page, 'Daniel', (d) => d.getByRole('slider', { name: 'Daniel Density' }).fill('100'))

  await page.goto('/casino')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'vapor')
  expect(await page.evaluate(() => getComputedStyle(document.body, '::before').backgroundImage)).toContain('gradient')
  expect(await page.getByTestId('casino').locator('h1').first().evaluate((h) => getComputedStyle(h).fontFamily)).toMatch(/Comic/)
  // (The busy cursor while a page loads beats the chosen one; once it's loaded, the choice shows.)
  await expect(page.locator('html')).not.toHaveAttribute('data-loading')
  expect(await page.evaluate(() => getComputedStyle(document.body).cursor)).toMatch(/url\(.*wait/)
  const pictures = await page.getByTestId('casino').locator('img').evaluateAll((imgs) => imgs.map((i) => i.getAttribute('src')))
  expect(pictures.length).toBeGreaterThan(5)
  expect(pictures.filter((src) => !src?.startsWith('/me/'))).toEqual([])
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('settings')))!).music).toBe(0.4)
  // /boring stays boring.
  await page.goto('/boring')
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /./)
})

test('the Chaos dial scales the GIF confetti (Normal is the site as it always was)', async ({ page }) => {
  await prepare(page)
  const count = async (chaos: string) => {
    await page.evaluate((c) => localStorage.setItem('settings', JSON.stringify({ chaos: c })), chaos)
    await page.goto('/dealership')
    await page.getByTestId('gif-confetti').waitFor({ state: 'attached' })
    await page.waitForTimeout(300)
    return page.getByTestId('gif-confetti').locator('img').count()
  }
  await page.goto('/dealership')
  const normal = await count('normal')
  expect(await count('calm')).toBeLessThan(normal)
  expect(await count('max')).toBeGreaterThan(normal)
})

test('Daniel Cam is a live feed of the new selfies', async ({ page }) => {
  await prepare(page)
  await page.goto('/settings')
  await page.getByRole('button', { name: 'Daniel Properties' }).click()
  await page.getByTestId('applet').getByRole('button', { name: /Watch Daniel Cam/ }).click()
  const cam = page.getByTestId('daniel-cam')
  await expect(cam).toBeVisible()
  const shown = () => cam.locator('img.opacity-100').getAttribute('src')
  const first = await shown()
  expect(first).toMatch(/\/me\/MISC-(1[4-9]|2\d)\.JPG/)
  await expect.poll(shown, { timeout: 5_000 }).not.toBe(first)
})

/** Answers whatever the survey is asking right now (by its data-kind). */
async function answerSurveyStep(page: Page) {
  const step = page.getByTestId('survey').locator('fieldset')
  const kind = await step.getAttribute('data-kind')
  const id = await step.getAttribute('data-step')
  if (kind === 'choice' || kind === 'flee') await step.getByRole('button').first().click()
  else if (kind === 'text') {
    await step.getByRole('textbox').pressSequentially('hi')
    await expect(step.getByRole('textbox')).toHaveValue('Da')
    await step.getByRole('button', { name: 'Next ›' }).click()
  } else if (kind === 'scale' || kind === 'checks' || kind === 'select') await step.getByRole('button', { name: 'Next ›' }).click()
  else if (await step.getByRole('button', { name: 'Start again' }).count()) await step.getByRole('button', { name: 'Start again' }).click()
  else if (await step.getByRole('button', { name: 'Square 1' }).count()) {
    await step.getByRole('button', { name: 'Square 1' }).click()
    await step.getByRole('button', { name: 'Verify' }).click()
    await step.getByRole('button', { name: /Continue/ }).click()
  } else await step.getByRole('button', { name: 'Skip ad ›' }).click({ timeout: 6_000 })
  // Wait for the next step (or the results) before going on.
  await expect(page.getByTestId('survey').locator(`fieldset[data-step="${id}"]`)).toHaveCount(0)
  return kind
}

test('the survey: every kind of question, an interruption, and it fits the screen', async ({ page }) => {
  await prepare(page)
  await page.goto('/survey')
  await expect(page.getByText('Question 1 of 3')).toBeVisible()
  const kinds = new Set<string | null>()
  for (let i = 0; i < 16; i++) {
    kinds.add(await answerSurveyStep(page))
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)
  }
  expect([...kinds].sort()).toEqual(['checks', 'choice', 'flee', 'interrupt', 'scale', 'select', 'text'])
  await expect(page.getByText(/Question 16 of 16/)).toBeVisible()
  await expect(page.getByText('Almost there!!! (you are not almost there)')).toBeVisible()
})

test('the survey picks up where you left off, and the end compares you with everyone else before the horse', async ({ page }) => {
  await prepare(page)
  await page.goto('/survey')
  await page.getByTestId('survey').locator('fieldset').waitFor()
  // Five questions in, you wandered off to the casino. Back again, it carries on from question 6.
  // (Not a refresh: that always goes back to the enter gate on the home page.)
  await page.evaluate(() => sessionStorage.setItem('survey', JSON.stringify({ step: 5, answers: { heard: 'A horse' } })))
  await page.goto('/casino')
  await page.goto('/survey')
  await expect(page.getByText('Question 6 of 6')).toBeVisible()
  await answerSurveyStep(page)
  await expect(page.getByText('Question 7 of 7')).toBeVisible()
  // An hour later, all done (the unit tests answer every last step on the way here).
  await page.evaluate(() => sessionStorage.setItem('survey', JSON.stringify({ step: 9999, answers: { rate: '10', like: 'Yes' } })))
  await page.goto('/casino')
  await page.goto('/survey')
  const results = page.getByTestId('survey-results')
  await expect(results).toContainText('YOUR ANSWERS vs EVERYONE ELSE’S')
  await expect(results).toContainText('✔ You agree with everyone.')
  await expect(results).toContainText('✘ Everyone else is right.')
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)
  await results.getByRole('button', { name: 'CLAIM MY HORSE »' }).click()
  await expect(page).toHaveURL(/\/you-won$/)
})

test('home’s ad wall has POPNUKE: a skyscraper down the right on desktop, a banner on smaller screens', async ({ page }) => {
  await prepare(page)
  await page.goto('/')
  const wall = page.getByTestId('ad-wall')
  await wall.scrollIntoViewIfNeeded()
  const shown = wall.locator('[data-ad="popnuke"]:visible')
  await expect(shown).toHaveCount(1)
  const wide = (page.viewportSize()?.width ?? 0) >= 1024
  const box = (await shown.boundingBox())!
  if (wide) {
    expect(box.height).toBeGreaterThan(500) // the skyscraper
    const others = await wall.locator('[data-ad]:visible:not([data-ad="popnuke"])').evaluateAll((els) => Math.max(...els.map((e) => e.getBoundingClientRect().right)))
    expect(box.x).toBeGreaterThanOrEqual(others)
  } else expect(box.height).toBeLessThan(200) // the banner
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)
  await shown.click()
  await expect(page).toHaveURL(/\/popnuke$/)
})
