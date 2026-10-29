import { describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from '../routes'
import { WEBRING } from '../lib/sitemap'
import { daniel } from '../content/daniel'
import { VIRUS_ALERT_DELAY_MS } from '../components/VirusAlert'
import { SURVEY } from '../content/survey'
import { DEX } from '../lib/discovery'
import { DEX_MILESTONES } from '../content/desktop'

// The real hunt is sealed with answers that live only in the gitignored secrets/ folder; these tests never see them.
// They get their own sealed page and locked folder instead, sealed fresh with answers that are fine to commit.
vi.mock('../sealed/hunt.json', async () => {
  const { makeSeal } = await import('../lib/seal')
  const page = { title: 'FIXTURE SHRINE', subtitle: 'sealed for the tests', sections: [{ heading: 'a test', body: ['a paragraph'], armour: ['ABC'] }] }
  return {
    default: {
      pages: [await makeSeal(page, '/test-shrine')],
      locks: { exam: await makeSeal([{ name: 'exam_answers.txt', kind: 'txt', text: 'the file was a decoy' }], 'fixture answer') },
    },
  }
})

const renderAt = (path: string, { entered = true } = {}) => {
  if (entered) sessionStorage.setItem('entered', 'true')
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

const testIds: Record<string, string> = {
  '/': 'home',
  '/dealership': 'dealership',
  '/guestbook': 'guestbook',
  '/under-construction': 'under-construction',
  '/you-won': 'you-won',
  '/checkout': 'checkout',
  '/leave': 'leave',
  '/scan': 'scan',
  '/casino': 'casino',
  '/survey': 'survey',
  '/work-from-home': 'work-from-home',
  '/arcade': 'arcade',
  '/desktop': 'desktop',
  '/radio': 'radio',
  '/oracle': 'oracle',
  '/blinkie-maker': 'blinkie-maker',
  '/stickers': 'stickers',
  '/dex': 'dex',
  '/popnuke': 'popnuke',
  '/settings': 'settings',
}

describe('routes', () => {
  it.each(WEBRING)('%s renders', async (path) => {
    renderAt(path)
    const id = path.startsWith('/shrine/') ? 'shrine' : testIds[path]
    // findBy: the Cyber Town pages are lazy routes and arrive a tick later.
    expect(await screen.findByTestId(id)).toBeInTheDocument()
  })

  it.each(['/definitely/not/here', '/shrine/nope'])('%s shows the blue screen', async (path) => {
    renderAt(path)
    expect(await screen.findByTestId('bsod')).toBeInTheDocument()
    expect(screen.queryByTestId('shrine')).toBeNull()
    expect(screen.queryByTestId('sealed-page')).toBeNull()
  })

  it('/boring is calm: no chat, no webring, real links', () => {
    renderAt('/boring')
    expect(screen.getByTestId('boring')).toBeInTheDocument()
    expect(screen.queryByTestId('chat-toggle')).toBeNull()
    expect(screen.queryByRole('navigation', { name: 'Webring' })).toBeNull()
    expect(screen.queryByTestId('mute')).toBeNull()
    expect(screen.queryByTestId('mini-player')).toBeNull()
    expect(screen.getByRole('link', { name: daniel.links.github! })).toHaveAttribute('href', daniel.links.github)
  })

  it('home links to every Cyber Town page and, via sponsored buttons, every scam page', () => {
    renderAt('/')
    const town = screen.getByRole('list', { name: 'Cyber Town' })
    const hrefs = within(town).getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(['/arcade', '/desktop', '/radio', '/oracle', '/blinkie-maker', '/stickers', '/dex'])
    const sponsored = within(screen.getByRole('list', { name: 'Sponsored links' })).getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(sponsored).toEqual(['/scan', '/casino', '/survey', '/work-from-home', '/popnuke'])
  })

  it('a Daniel model shows the same photo on the home page as at the dealership', () => {
    const photosByName = (root: HTMLElement) =>
      Object.fromEntries(
        [...root.querySelectorAll('p.truncate')].map((name) => [name.textContent, name.parentElement!.querySelector('img')!.getAttribute('src')]),
      )
    renderAt('/')
    const home = photosByName(document.querySelector('[data-band="lease"]')!)
    cleanup()
    renderAt('/dealership')
    const dealership = photosByName(screen.getByTestId('dealership'))
    expect(Object.keys(home)).toEqual(['Daniel Stoner', 'Daniel', 'Daniel Washee Washee'])
    for (const [name, src] of Object.entries(home)) expect(src, name).toBe(dealership[name])
  })

  it('the table of contents goes where each chapter says', () => {
    renderAt('/')
    const toc = screen.getByText('TABLE OF CONTENTS').parentElement!
    const where = within(toc).getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')])
    expect(where).toEqual([
      ['Introduction', '#welcome'],
      ['Kettles', '/shrine/kettle'],
      ['Despair (Abridged)', '/shrine/norminette'],
      ['Horses', '/shrine/horses'],
      ['Segmentation', '/shrine/segfault'],
      ['The End', '#end'],
      ['The End (Director’s Cut)', '/leave'],
    ])
  })

  it('the taskbar links Home, Guestbook, Settings and Donate, shows where you are, and the logo goes home', () => {
    renderAt('/guestbook')
    const bar = screen.getByRole('navigation', { name: 'Main' })
    const links = within(bar).getAllByRole('link')
    expect(links.map((a) => [a.getAttribute('aria-label'), a.getAttribute('href')])).toEqual([
      ['Home', '/'],
      ['Guestbook', '/guestbook'],
      ['Settings', '/settings'],
      ['DONATE', '/under-construction'],
      ["Daniel Cheng's World Wide Web Site: home", '/'],
    ])
    expect(within(bar).getByRole('link', { name: 'Guestbook' })).toHaveAttribute('aria-current', 'page')
    expect(within(bar).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
    expect(within(bar).getByAltText('Daniel')).toHaveAttribute('src', '/me/head-grind.png')
  })

  it.each(['/boring', '/leave', '/this/does/not/exist'])('%s has no taskbar', (path) => {
    renderAt(path)
    expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull()
  })

  it('the dealership logo is Daniel grinning again', () => {
    renderAt('/dealership')
    expect(within(screen.getByTestId('dealership').querySelector('header')!).getByAltText('Daniel')).toHaveAttribute('src', '/me/head-grind.png')
  })

  it('Control Panel: a change is only saved on Apply or OK, Cancel forgets it, and the theme lands on <html>', async () => {
    renderAt('/settings')
    const panel = await screen.findByTestId('settings')
    await userEvent.click(within(panel).getByRole('button', { name: 'Display Properties' }))
    let dialog = screen.getByTestId('applet')
    await userEvent.click(within(dialog).getByRole('radio', { name: /CRT Hacker/ }))
    expect(screen.getByTestId('theme-preview')).toHaveAttribute('data-theme', 'crt')
    expect(document.documentElement.dataset.theme).toBeUndefined()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await act(() => new Promise((r) => setTimeout(r, 350))) // eases shut
    expect(screen.queryByTestId('applet')).toBeNull()
    expect(document.documentElement.dataset.theme).toBeUndefined()

    await userEvent.click(within(panel).getByRole('button', { name: 'Display Properties' }))
    dialog = screen.getByTestId('applet')
    await userEvent.click(within(dialog).getByRole('radio', { name: /CRT Hacker/ }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'Apply' }))
    expect(document.documentElement.dataset.theme).toBe('crt')
    expect(JSON.parse(localStorage.getItem('settings')!).theme).toBe('crt')
    delete document.documentElement.dataset.theme
  })

  it('Daniel Density at 100% turns every picture into Daniel', () => {
    localStorage.setItem('settings', JSON.stringify({ density: 100 }))
    renderAt('/casino')
    const pictures = [...screen.getByTestId('casino').querySelectorAll('img')]
    expect(pictures.length).toBeGreaterThan(5)
    expect(pictures.every((img) => img.getAttribute('src')!.startsWith('/me/'))).toBe(true)
  })

  it('the POPNUKE tray badge only shows once it is installed', () => {
    renderAt('/casino')
    expect(screen.queryByTestId('popnuke-badge')).toBeNull()
    cleanup()
    localStorage.setItem('popnuke', 'true')
    localStorage.setItem('popnukeBlocked', '7')
    renderAt('/casino')
    expect(screen.getByTestId('popnuke-badge')).toHaveTextContent('POPNUKE: 7 blocked')
    expect(screen.getByTestId('popnuke-badge')).toHaveAttribute('href', '/popnuke')
  })

  it('Melly the pet sits in a minimisable window on fun pages, not on /boring or the gags', async () => {
    renderAt('/dealership')
    const pet = screen.getByTestId('pet-window')
    expect(within(pet).getByTitle('Melly the Gify pet')).toHaveAttribute('src', daniel.petUrl)
    await userEvent.click(within(pet).getByRole('button', { name: 'Minimise Melly.exe' }))
    expect(within(pet).getByTitle('Melly the Gify pet').parentElement).toHaveClass('hidden')
    expect(JSON.parse(localStorage.getItem('petMinimised')!)).toBe(true)
  })

  it.each(['/boring', '/leave'])('%s has no pet window', (path) => {
    renderAt(path)
    expect(screen.queryByTestId('pet-window')).toBeNull()
  })

  it('collecting a hidden sticker saves it and shows a toast', async () => {
    renderAt('/dealership')
    await userEvent.click(screen.getByTestId('hidden-sticker'))
    expect(JSON.parse(localStorage.getItem('stickers')!)).toEqual(['cupcake'])
    expect(screen.getByRole('status')).toHaveTextContent(/STICKER GET! Cupcake \(1\/12\)/)
    expect(screen.queryByTestId('hidden-sticker')).toBeNull()
  })

  it.each(['Yes', 'No', 'Cancel', 'Close'])('the Albanian virus pops up once a while in, and "%s" closes it', async (label) => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    renderAt('/dealership')
    expect(screen.queryByTestId('virus-alert')).toBeNull()
    act(() => vi.advanceTimersByTime(VIRUS_ALERT_DELAY_MS))
    const alert = screen.getByRole('alertdialog', { name: 'Virus Alert' })
    expect(alert).toHaveTextContent('Hi, I am Albanian virus')
    expect(within(alert).queryByRole('button', { name: /minimi/i })).toBeNull()
    await userEvent.click(within(alert).getByRole('button', { name: label }))
    act(() => vi.advanceTimersByTime(400)) // it eases shut first
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(sessionStorage.getItem('virusAlertSeen')).toBe('true')
    vi.useRealTimers()
  })

  it('shows the enter gate on first visit and drops it after clicking', async () => {
    renderAt('/', { entered: false })
    const gate = screen.getByRole('dialog', { name: 'Enter the site' })
    await userEvent.click(within(gate).getByRole('button'))
    expect(screen.queryByRole('dialog', { name: 'Enter the site' })).toBeNull()
    expect(sessionStorage.getItem('entered')).toBe('true')
  })

  it('every page except the fullscreen traps has the webring', () => {
    renderAt('/dealership')
    expect(screen.getByRole('navigation', { name: 'Webring' })).toBeInTheDocument()
  })
})

describe('interactions', () => {
  it('guestbook entries persist to localStorage', async () => {
    renderAt('/guestbook')
    await userEvent.type(screen.getByLabelText(/Your name/), 'Tester')
    await userEvent.type(screen.getByLabelText(/Message/), 'hello from the test')
    await userEvent.click(screen.getByRole('button', { name: /SIGN IT/ }))
    expect(screen.getByText('hello from the test')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('guestbook')!)[0].name).toBe('Tester')
  })

  it('guestbook pager never offers page 3', () => {
    renderAt('/guestbook')
    const pager = screen.getByRole('navigation', { name: 'Guestbook pages' })
    expect(within(pager).queryByRole('button', { name: '3' })).toBeNull()
  })

  it('live chat replies after typing', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    renderAt('/dealership')
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    await user.click(screen.getByTestId('chat-toggle'))
    await user.type(screen.getByLabelText('Message'), 'horse')
    await user.click(screen.getByRole('button', { name: 'SEND' }))
    expect(screen.getByTestId('typing')).toBeInTheDocument()
    await act(() => vi.advanceTimersByTimeAsync(4000))
    expect(screen.queryByTestId('typing')).toBeNull()
    expect(screen.getAllByText(/neigh|HORSES/i).length).toBeGreaterThan(0)
    vi.useRealTimers()
  })

  it('the leave dialog eventually sends you home', async () => {
    const router = renderAt('/leave')
    for (let i = 0; i < 7; i++) await userEvent.click(screen.getByRole('button', { name: 'Yes' }))
    expect(router.state.location.pathname).toBe('/')
  })

  it('countdown resets instead of expiring', () => {
    vi.useFakeTimers()
    renderAt('/dealership')
    const timers = screen.getAllByTestId('countdown')
    act(() => vi.advanceTimersByTime(35_000))
    for (const t of timers) expect(t.textContent).toMatch(/\d\d:\d\d/)
    vi.useRealTimers()
  })

  it('missing images render a labelled SUPPLY ME placeholder', async () => {
    renderAt('/boring')
    const img = screen.getByAltText(daniel.name)
    await act(async () => img.dispatchEvent(new Event('error')))
    expect(screen.getByLabelText('placeholder: normal headshot')).toHaveTextContent('SUPPLY ME: headshot.jpg')
  })
})

/** Answers whatever the survey is asking right now (by its data-kind), the quickest way through. */
async function answerSurveyStep(user: ReturnType<typeof userEvent.setup>, advance: () => void) {
  const step = (await screen.findByTestId('survey')).querySelector('fieldset')!
  const box = within(step as HTMLElement)
  switch (step.getAttribute('data-kind')) {
    case 'choice':
      return user.click(box.getAllByRole('button')[0])
    case 'flee':
      return user.click(box.getAllByRole('button')[0]) // Yes
    case 'text':
      await user.type(box.getByRole('textbox'), 'x')
      return user.click(box.getByRole('button', { name: 'Next ›' }))
    case 'scale':
    case 'checks':
    case 'select':
      return user.click(box.getByRole('button', { name: 'Next ›' }))
    case 'interrupt':
      if (box.queryByRole('button', { name: 'Start again' })) return user.click(box.getByRole('button', { name: 'Start again' }))
      if (box.queryByRole('button', { name: 'Square 1' })) {
        await user.click(box.getByRole('button', { name: 'Square 1' }))
        await user.click(box.getByRole('button', { name: 'Verify' }))
        return user.click(box.getByRole('button', { name: /Continue/ }))
      }
      for (let i = 0; i < 3; i++) act(advance) // the ad break's countdown, a second at a time
      return user.click(await box.findByRole('button', { name: 'Skip ad ›' }))
  }
}

describe('the survey', () => {
  it('can (just about) be finished: a hundred questions, three kinds of interruption, results, then the horse', { timeout: 60_000 }, async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const router = renderAt('/survey')
    expect(await screen.findByText('Question 1 of 3')).toBeInTheDocument()
    for (let i = 0; i < SURVEY.length; i++) await answerSurveyStep(user, () => vi.advanceTimersByTime(1_050))
    const results = screen.getByTestId('survey-results')
    expect(results).toHaveTextContent('YOUR ANSWERS vs EVERYONE ELSE’S')
    expect(results).toHaveTextContent('0.0% unique')
    await user.click(within(results).getByRole('button', { name: 'CLAIM MY HORSE »' }))
    expect(router.state.location.pathname).toBe('/you-won')
    vi.useRealTimers()
  })

  it('remembers where you were this visit', async () => {
    const user = userEvent.setup()
    renderAt('/survey')
    await answerSurveyStep(user, () => {})
    await answerSurveyStep(user, () => {})
    expect(await screen.findByText('Question 3 of 3')).toBeInTheDocument()
    cleanup()
    renderAt('/survey')
    expect(await screen.findByText('Question 3 of 3')).toBeInTheDocument()
    expect(JSON.parse(sessionStorage.getItem('survey')!).answers.heard).toBe('A friend')
  })

  /** Jumps straight to the first question of a kind. */
  const at = async (kind: string) => {
    const step = SURVEY.findIndex((s) => s.kind === kind)
    sessionStorage.setItem('survey', JSON.stringify({ step, answers: {} }))
    renderAt('/survey')
    return within((await screen.findByTestId('survey')).querySelector(`fieldset[data-kind="${kind}"]`) as HTMLElement)
  }

  it('the slider only ever says 10', async () => {
    const q = await at('scale')
    const slider = q.getByRole('slider', { name: 'Rating' })
    fireEvent.change(slider, { target: { value: '3' } })
    expect(slider).toHaveValue('10')
    expect(q.getByText('(nice try)')).toBeInTheDocument()
  })

  it('"I like Daniel" will not come unticked; the others will', async () => {
    const user = userEvent.setup()
    const q = await at('checks')
    const daniel = q.getByRole('checkbox', { name: 'Daniel' })
    await user.click(daniel)
    expect(daniel).toBeChecked()
    expect(q.getByText('nice try')).toBeInTheDocument()
    const kettles = q.getByRole('checkbox', { name: 'Kettles' })
    await user.click(kettles)
    expect(kettles).toBeChecked()
    await user.click(kettles)
    expect(kettles).not.toBeChecked()
  })

  it('whatever you type, it comes out as Daniel', async () => {
    const user = userEvent.setup()
    const q = await at('text')
    await user.type(q.getByRole('textbox'), 'my mum')
    expect(q.getByRole('textbox')).toHaveValue('Daniel')
  })

  it('No runs away three times, then gives up and becomes Yes', async () => {
    const user = userEvent.setup()
    const q = await at('flee')
    const no = q.getByRole('button', { name: 'Neigh' })
    for (let i = 0; i < 3; i++) await user.click(no)
    expect(no).toHaveTextContent('Yes (we heard you)')
    await user.click(no)
    expect(JSON.parse(sessionStorage.getItem('survey')!).answers.human).toBe('Yes')
  })
})

describe('home ad wall', () => {
  it('has a POPNUKE ad (the skyscraper down the right on desktop, a banner on smaller screens)', () => {
    renderAt('/')
    const ads = screen.getByTestId('ad-wall').querySelectorAll('[data-ad="popnuke"]')
    expect(ads).toHaveLength(2)
    expect(ads[1].closest('.lg\\:block')).not.toBeNull()
  })
})

describe('the rabbit hole', () => {
  it("the Dex shows ??? until you've found a specimen, and hands out hints as you go", async () => {
    const quarter = Math.ceil(DEX.length / 4)
    localStorage.setItem('dex', JSON.stringify(Object.fromEntries(DEX.slice(0, quarter).map((e) => [e.spec.id, '2026-10-29T12:00:00Z']))))
    renderAt('/dex')
    await screen.findByTestId('dex')
    const cards = screen.getAllByTestId('dex-card')
    expect(cards).toHaveLength(DEX.length)
    expect(cards.filter((c) => c.dataset.found === 'yes')).toHaveLength(quarter)
    expect(screen.getByTestId('dex-count')).toHaveTextContent(`${quarter} / ${DEX.length} CATALOGUED`)
    expect(screen.getByTestId('milestone-25')).toHaveTextContent(DEX_MILESTONES[0].hint)
    expect(screen.getByTestId('milestone-50')).not.toHaveTextContent(DEX_MILESTONES[1].hint)
    // The fragments they carry stay blank until the visitor has heard the song.
    expect(screen.getAllByTestId('fragment').every((f) => f.textContent === '·')).toBe(true)
  })

  it('once possessed, caught specimens show the old letters they carry', async () => {
    localStorage.setItem('possessed', 'true')
    localStorage.setItem('dex', JSON.stringify({ [DEX[0].spec.id]: '2026-10-29T12:00:00Z' }))
    renderAt('/dex')
    await screen.findByTestId('dex')
    expect(screen.getByTestId('fragment')).toHaveTextContent(DEX[0].spec.specimen!.glyph!)
  })

  it.each([
    ['/dex', 'dex', true],
    ['/desktop', 'desktop', true],
    ['/dealership', 'dealership', false], // the control: a normal page does get ambushed in that time
  ])('%s: pop-up ambushes and the virus alert only on loud pages', async (path, id, quiet) => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    renderAt(path)
    await screen.findByTestId(id)
    act(() => vi.advanceTimersByTime(Math.max(VIRUS_ALERT_DELAY_MS, 70_000)))
    expect(screen.queryByTestId('virus-alert') === null).toBe(quiet)
    expect(screen.queryAllByTestId('popup').length === 0).toBe(quiet)
    vi.useRealTimers()
  })

  it('a sealed page opens at its address only, marks the visitor, and the site turns', async () => {
    renderAt('/test-shrine')
    const page = await screen.findByTestId('sealed-page', {}, { timeout: 5000 })
    expect(page).toHaveTextContent('FIXTURE SHRINE')
    expect(screen.getByTestId('armour')).toHaveTextContent('ABC')
    expect(screen.queryByTestId('bsod')).toBeNull()
    expect(screen.getByTestId('taskbar')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('secrets')!).morse).toBeTruthy()
    expect(localStorage.getItem('possessed')).toBe('true')
    expect(await screen.findByTestId('possession')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-possessed')
  })

  it('the hymn only shows on the radio once a sealed page has been reached', async () => {
    renderAt('/radio')
    await screen.findByTestId('radio')
    expect(screen.queryByText(/Hymn \(Do Not Play\)/)).toBeNull()
    cleanup()
    localStorage.setItem('secrets', JSON.stringify({ morse: '2026-10-29T03:00:00Z' }))
    renderAt('/radio')
    await screen.findByTestId('radio')
    expect(screen.getAllByText(/Hymn \(Do Not Play\)/).length).toBeGreaterThan(0)
  })

  it('possessed, the Control Panel grows a Baptize applet, and baptism puts everything back', async () => {
    renderAt('/settings')
    await screen.findByTestId('settings')
    expect(screen.queryByRole('button', { name: 'Baptize Properties' })).toBeNull()
    cleanup()
    localStorage.setItem('possessed', 'true')
    renderAt('/settings')
    await screen.findByTestId('settings')
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-possessed'))
    // Fake time only for the baptism itself.
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    await user.click(screen.getByRole('button', { name: 'Baptize Properties' }))
    await user.click(within(screen.getByTestId('applet')).getByRole('button', { name: /^Baptize$/ }))
    expect(screen.getByTestId('baptism')).toHaveAttribute('data-stage', 'pour')
    act(() => vi.advanceTimersByTime(2_000))
    expect(screen.getByTestId('baptism')).toHaveAttribute('data-stage', 'under')
    act(() => vi.advanceTimersByTime(4_000))
    expect(screen.getByTestId('baptism')).toHaveAttribute('data-stage', 'clean')
    expect(localStorage.getItem('possessed')).toBe('false')
    expect(document.documentElement).not.toHaveAttribute('data-possessed')
    act(() => vi.advanceTimersByTime(2_000))
    expect(screen.queryByTestId('baptism')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Baptize Properties' })).toBeNull()
    vi.useRealTimers()
  })

  it('the jump scare: looking at his photo on the possessed desktop, once, ever', async () => {
    localStorage.setItem('possessed', 'true')
    sessionStorage.setItem('desktopOn', 'true')
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderAt('/desktop')
    await screen.findByTestId('desktop')
    await user.dblClick(within(screen.getByRole('list', { name: 'Desktop icons' })).getByRole('button', { name: 'My Computer' }))
    const win = screen.getByTestId('window-computer')
    const open = (name: string) => user.dblClick(within(within(win).getByRole('list', { name: 'Files' })).getByRole('button', { name }))
    await open('C:')
    await open('MY DOCUMENTS')
    await open('me.jpg')
    expect(screen.queryByTestId('jump-scare')).toBeNull()
    act(() => vi.advanceTimersByTime(2_000))
    expect(screen.getByTestId('jump-scare')).toBeInTheDocument()
    expect(localStorage.getItem('scared')).toBe('true')
    act(() => vi.advanceTimersByTime(700)) // held...
    act(() => vi.advanceTimersByTime(400)) // ...then faded
    expect(screen.queryByTestId('jump-scare')).toBeNull()
    await open('me.jpg')
    act(() => vi.advanceTimersByTime(2_000))
    expect(screen.queryByTestId('jump-scare')).toBeNull()
    vi.useRealTimers()
  })

  it('Daniel 95 boots: power, POST (skippable), splash, desktop; and shutting down ends safe to turn off', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderAt('/desktop')
    const desktop = await screen.findByTestId('desktop')
    expect(desktop).toHaveAttribute('data-power', 'off')
    await user.click(screen.getByRole('button', { name: 'Power' }))
    expect(desktop).toHaveAttribute('data-power', 'post')
    await user.click(screen.getByRole('button', { name: 'Skip the start-up checks' }))
    expect(desktop).toHaveAttribute('data-power', 'splash')
    act(() => vi.advanceTimersByTime(2_500))
    expect(desktop).toHaveAttribute('data-power', 'on')
    expect(sessionStorage.getItem('desktopOn')).toBe('true')
    await user.click(screen.getByRole('button', { name: 'Start' }))
    await user.click(screen.getByRole('button', { name: '⏻ Shut Down…' }))
    await user.click(within(screen.getByTestId('shutdown-dialog')).getByRole('button', { name: 'Yes' }))
    expect(desktop).toHaveAttribute('data-power', 'shutting')
    act(() => vi.advanceTimersByTime(2_700))
    expect(screen.getByTestId('screen-safe')).toHaveTextContent('safe to turn off')
    vi.useRealTimers()
  })

  it('pulling the plug means ScanDisk on the next boot', async () => {
    sessionStorage.setItem('desktopOn', 'true')
    const user = userEvent.setup()
    renderAt('/desktop')
    const desktop = await screen.findByTestId('desktop')
    expect(desktop).toHaveAttribute('data-power', 'on')
    await user.click(screen.getByRole('button', { name: 'Power' }))
    expect(desktop).toHaveAttribute('data-power', 'off')
    await user.click(screen.getByRole('button', { name: 'Power' }))
    await user.click(screen.getByRole('button', { name: 'Skip the start-up checks' }))
    expect(desktop).toHaveAttribute('data-power', 'scandisk')
    expect(screen.getByTestId('screen-scandisk')).toHaveTextContent('not shut down properly')
  })

  it('My Computer: double-click into folders, read a file, unlock a folder, show hidden files', async () => {
    sessionStorage.setItem('desktopOn', 'true')
    const user = userEvent.setup()
    renderAt('/desktop')
    await screen.findByTestId('desktop')
    await user.dblClick(within(screen.getByRole('list', { name: 'Desktop icons' })).getByRole('button', { name: 'My Computer' }))
    const win = screen.getByTestId('window-computer')
    const open = (name: string) => user.dblClick(within(within(win).getByRole('list', { name: 'Files' })).getByRole('button', { name }))
    await open('C:')
    expect(within(win).getByTestId('address')).toHaveTextContent('C:\\')
    await open('SCHOOL')
    await open('42')
    await open('norminette.log')
    expect(screen.getByTestId('viewer-text')).toHaveTextContent('Norme: KO')

    await open('exam_answers')
    const prompt = () => screen.getByRole('dialog', { name: 'Password for exam_answers' })
    await user.type(within(prompt()).getByLabelText(/Password/), '41{Enter}')
    expect(await within(prompt()).findByRole('alert', {}, { timeout: 5000 })).toHaveTextContent('incorrect')
    await user.type(within(prompt()).getByLabelText(/Password/), '  FIXTURE answer {Enter}')
    await within(win).findByText('exam_answers.txt', {}, { timeout: 5000 })
    expect(screen.queryByRole('dialog', { name: 'Password for exam_answers' })).toBeNull()
    expect(within(win).getByTestId('address')).toHaveTextContent('C:\\SCHOOL\\42\\exam_answers')
    expect(JSON.parse(localStorage.getItem('desktopKeys')!)).toEqual({ 'C:\\SCHOOL\\42\\exam_answers': '  FIXTURE answer ' })
    await open('exam_answers.txt')
    expect(screen.getByTestId('viewer-text')).toHaveTextContent('decoy')

    for (let i = 0; i < 3; i++) await user.click(within(win).getByRole('button', { name: '↑ Up' }))
    expect(within(win).queryByRole('button', { name: '.secret' })).toBeNull()
    await user.click(within(win).getByRole('button', { name: 'View' }))
    await user.click(within(win).getByLabelText('Show hidden files'))
    await open('.secret')
    expect(screen.getByTestId('viewer-text')).toHaveTextContent('hidden files')
  })

  it('an empty floppy drive is not ready', async () => {
    sessionStorage.setItem('desktopOn', 'true')
    const user = userEvent.setup()
    renderAt('/desktop')
    await screen.findByTestId('desktop')
    await user.dblClick(within(screen.getByRole('list', { name: 'Desktop icons' })).getByRole('button', { name: 'My Computer' }))
    const win = screen.getByTestId('window-computer')
    await user.dblClick(within(within(win).getByRole('list', { name: 'Files' })).getByRole('button', { name: 'A:' }))
    expect(within(win).getByRole('alertdialog')).toHaveTextContent('The device is not ready')
  })
})
