import { expect, test, type Locator, type Page } from '@playwright/test'

const ROUTES = ['/', '/dealership', '/shrine/segfault', '/shrine/kettle', '/shrine/chiikawa', '/guestbook', '/under-construction', '/you-won', '/checkout', '/leave', '/scan', '/casino', '/survey', '/work-from-home', '/arcade', '/desktop', '/radio', '/oracle', '/blinkie-maker', '/stickers', '/boring']

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
  // Back past the first track wraps round to the last song.
  for (let n = 0; n < 4; n++) await player.getByRole('button', { name: 'Previous track' }).click()
  await expect(player.getByTestId('now-playing')).toContainText('Sticker Pop')
  await player.getByRole('button', { name: 'Minimise player' }).click()
  await expect(player.getByTestId('now-playing')).toHaveCount(0)
  await expect(player).toContainText('Sticker Pop')
})

test('hovering a track in the music list never shakes it (no jiggle, no sideways overflow)', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1000) < 640, 'the track list is hidden on phones')
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

test('the Azerbaijan virus alert appears a while in and any button closes it', async ({ page }) => {
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
  '/arcade', '/desktop', '/radio', '/oracle', '/blinkie-maker', '/stickers', '/leave', '/this/does/not/exist',
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
      for (const p of await hiddenObjects(page)) problems.push(`${path} @${scroll}: ${p}`)
    }
  }
  expect(problems).toEqual([])
})

test('clicking an object in the margin opens its properties window, not whatever is underneath', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1000) < 640, 'phones only get drifters')
  await prepare(page)
  await page.goto('/casino')
  const die = page.locator('[data-object="dice-a"]')
  await expect.poll(() => drawnPixels(die), { timeout: 10_000 }).toBeGreaterThan(20)
  const box = (await die.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
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
  await page.goto('/this/does/not/exist')
  await expect(page.getByTestId('bsod')).toBeVisible()
  // The crash screen still covers the site's floating chat button.
  const chat = page.getByRole('button', { name: /LIVE CHAT/ })
  const cb = (await chat.boundingBox())!
  expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('[data-testid="bsod"]') !== null, [cb.x + 5, cb.y + 5])).toBe(true)
  // Whichever crashed object has room to show at this screen size.
  const shown = page.locator('[data-testid="object-3d"]:not([style*="opacity: 0"])').first()
  await expect.poll(() => drawnPixels(shown), { timeout: 10_000 }).toBeGreaterThan(20)
  const box = (await shown.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
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

test('the loading wipe plays again over Home after CLICK HERE TO ENTER', async ({ page }) => {
  await prepare(page, { skipGate: false })
  await page.goto('/')
  const first = await page.getByTestId('page-wipe').elementHandle()
  await page.getByRole('dialog', { name: 'Enter the site' }).getByRole('button').click()
  await expect.poll(() => first!.evaluate((e) => e.isConnected)).toBe(false)
  await expect(page.getByTestId('page-wipe')).toHaveCSS('animation-name', 'page-wipe')
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
  await page.clock.install()
  await prepare(page)
  await page.goto('/')
  const dodgers = page.locator('[data-testid="popup"][data-variant="dodge"]')
  // Ambush popups pick a random variant; close the others (topmost first: "multiply" ones split into
  // overlapping pairs) and wait for the next until a dodger turns up.
  for (let i = 0; i < 60 && (await dodgers.count()) === 0; i++) {
    const other = page.locator('[data-testid="popup"]:not([data-variant="dodge"])').last()
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
