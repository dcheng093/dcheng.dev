import { describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from '../routes'
import { WEBRING } from '../lib/sitemap'
import { daniel } from '../content/daniel'
import { VIRUS_ALERT_DELAY_MS } from '../components/VirusAlert'
import { SURVEY } from '../content/survey'

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

  it.each(['/definitely/not/here', '/shrine/nope'])('%s shows the blue screen', (path) => {
    renderAt(path)
    expect(screen.getByTestId('bsod')).toBeInTheDocument()
    expect(screen.queryByTestId('shrine')).toBeNull()
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
    expect(hrefs).toEqual(['/arcade', '/desktop', '/radio', '/oracle', '/blinkie-maker', '/stickers'])
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
