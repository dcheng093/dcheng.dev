import { describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from '../routes'
import { WEBRING } from '../lib/sitemap'
import { daniel } from '../content/daniel'

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
}

describe('routes', () => {
  it.each(WEBRING)('%s renders', (path) => {
    renderAt(path)
    const id = path.startsWith('/shrine/') ? 'shrine' : testIds[path]
    expect(screen.getByTestId(id)).toBeInTheDocument()
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
    expect(screen.getByRole('link', { name: daniel.links.github! })).toHaveAttribute('href', daniel.links.github)
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
