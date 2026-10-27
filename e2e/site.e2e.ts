import { expect, test, type Page } from '@playwright/test'

const ROUTES = ['/', '/dealership', '/shrine/segfault', '/shrine/kettle', '/shrine/chiikawa', '/guestbook', '/under-construction', '/you-won', '/checkout', '/leave', '/boring']

/** Skip the enter gate (sessionStorage) and collect real errors, ignoring 404s for not-yet-supplied images. */
async function prepare(page: Page, { skipGate = true } = {}) {
  if (skipGate) await page.addInitScript(() => sessionStorage.setItem('entered', 'true'))
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`console: ${m.text()}`)
  })
  return errors
}

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
