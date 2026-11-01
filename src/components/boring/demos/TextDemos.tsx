import { useMemo } from 'react'
import { useTicks } from './loop'
import { CALLS, decode } from './logic/callMeMaybe'
import { ftPrintf, gnlTrace } from './logic/textTools'

type DemoProps = { active: boolean }

const panel = 'flex h-full w-full flex-col overflow-hidden rounded-xl bg-[#0b0a12] p-4 font-mono text-[11px] leading-relaxed text-white/80 sm:text-xs'

// ——— Libft: the test run going green ———

// libft.h, in the order the tester runs them: libc first, then the extras, then the list bonus.
const LIBFT = [
  'isalpha', 'isdigit', 'isalnum', 'isascii', 'isprint', 'strlen', 'memset', 'bzero', 'memcpy', 'memmove', 'strlcpy',
  'strlcat', 'toupper', 'tolower', 'strchr', 'strrchr', 'strncmp', 'memchr', 'memcmp', 'strnstr', 'atoi', 'calloc',
  'strdup', 'substr', 'strjoin', 'strtrim', 'split', 'itoa', 'strmapi', 'striteri', 'putchar_fd', 'putstr_fd',
  'putendl_fd', 'putnbr_fd', 'lstnew', 'lstadd_front', 'lstsize', 'lstlast', 'lstadd_back', 'lstdelone', 'lstclear',
  'lstiter', 'lstmap',
].map((f) => `ft_${f}`)

type Line = { text: string; tone: 'cmd' | 'out' | 'ok' | 'done'; typed?: boolean }

const LIBFT_SCRIPT: Line[] = [
  { text: '$ make bonus', tone: 'cmd', typed: true },
  { text: 'cc -Wall -Wextra -Werror -c ft_*.c', tone: 'out' },
  { text: 'ar rcs libft.a ft_*.o', tone: 'out' },
  { text: '$ ./tester', tone: 'cmd', typed: true },
  ...LIBFT.map((f): Line => ({ text: f, tone: 'ok' })),
  { text: `${LIBFT.length}/${LIBFT.length} passed · 125/100`, tone: 'done' },
]

/** How far a script has got at `tick`: commands type a character a tick, everything else lands a line a tick. */
function scriptAt(script: Line[], tick: number, hold: number) {
  const cost = script.map((l) => (l.typed ? l.text.length + 3 : 1))
  const total = cost.reduce((a, b) => a + b, 0) + hold
  let left = tick % total
  const shown: { line: Line; chars: number }[] = []
  for (let i = 0; i < script.length && left > 0; i++) {
    const take = Math.min(left, cost[i])
    shown.push({ line: script[i], chars: script[i].typed ? Math.min(take, script[i].text.length) : script[i].text.length })
    left -= take
  }
  return shown
}

export function LibftDemo({ active }: DemoProps) {
  const tick = useTicks(active, 70)
  const shown = scriptAt(LIBFT_SCRIPT, tick + 1, 40).slice(-13)
  return (
    <div className={panel} aria-hidden>
      {shown.map(({ line, chars }, i) => (
        <p key={`${line.text}-${i}`} className="flex justify-between gap-2 whitespace-pre">
          {line.tone === 'ok' ? (
            <>
              <span>{line.text.padEnd(16, ' ')}<span className="text-white/25">{'.'.repeat(14)}</span></span>
              <span className="text-emerald-400">[OK]</span>
            </>
          ) : (
            <span className={line.tone === 'cmd' ? 'text-[var(--accent)]' : line.tone === 'done' ? 'font-bold text-emerald-400' : 'text-white/45'}>
              {line.text.slice(0, chars)}
              {line.typed && chars < line.text.length && <span className="animate-pulse">▌</span>}
            </span>
          )}
        </p>
      ))}
    </div>
  )
}

// ——— ft_printf: each conversion lighting up and printing ———

const FORMAT = 'Hi %s! %d%% done, try #%u, grade %c\n%p -> %x / %X'
const PIECES = ftPrintf(FORMAT, ['42KL', 125, 1, 65, 0x7ffd5e8c, 48879, 48879])

export function PrintfDemo({ active }: DemoProps) {
  const tick = useTicks(active, 90)
  const total = PIECES.reduce((n, p) => n + p.out.length + (p.conv ? 6 : 0), 0) + 30
  // Walk the pieces: a conversion pauses (lit up) before its output types out.
  let left = tick % total
  let current = -1
  const out: string[] = []
  for (let i = 0; i < PIECES.length && left > 0; i++) {
    current = i
    const pause = PIECES[i].conv ? 6 : 0
    const typed = Math.max(0, Math.min(PIECES[i].out.length, left - pause))
    out.push(PIECES[i].out.slice(0, typed))
    left -= pause + PIECES[i].out.length
  }
  const done = left > 0
  const printed = out.join('')
  return (
    <div className={`${panel} justify-center gap-4`} aria-hidden>
      <p className="break-all text-white/60">
        ft_printf(<span className="text-amber-300">&quot;</span>
        {PIECES.map((p, i) => (
          <span
            key={i}
            className={p.conv ? `rounded px-0.5 transition-colors duration-200 ${i === current && !done ? 'bg-[var(--accent)] text-black' : 'text-[var(--accent)]'}` : 'text-amber-300'}
          >
            {p.src.replace('\n', '\\n')}
          </span>
        ))}
        <span className="text-amber-300">&quot;</span>, …);
      </p>
      <div className="rounded-lg border border-white/10 bg-black/40 p-3">
        <p className="mb-1 text-[10px] uppercase tracking-widest text-white/30">stdout</p>
        <p className="min-h-[3.5em] whitespace-pre-wrap break-all text-white">
          {printed}
          {!done && <span className="animate-pulse text-[var(--accent)]">▌</span>}
        </p>
      </div>
      <p className={`text-emerald-400 transition-opacity duration-300 ${done ? 'opacity-100' : 'opacity-0'}`}>→ returned {PIECES.reduce((n, p) => n + p.out.length, 0)}</p>
    </div>
  )
}

// ——— get_next_line: reads into the stash, lines out ———

const FILE = 'Apple\nBanana\nCherry\nDragon fruit'
const BUFFER = 5
const TRACE = gnlTrace(FILE, BUFFER)

export function GnlDemo({ active }: DemoProps) {
  const tick = useTicks(active, 650)
  const step = tick % (TRACE.length + 4)
  const seen = TRACE.slice(0, step)
  const now = seen.at(-1)
  const read = seen.filter((e) => e.kind === 'read')
  const lastRead = read.at(-1)
  const consumed = lastRead && lastRead.kind === 'read' ? lastRead.at + lastRead.bytes.length : 0
  const chunk = now?.kind === 'read' ? [now.at, now.at + now.bytes.length] : null
  const lines = seen.filter((e) => e.kind === 'line')
  const stash = now?.stash ?? ''
  const show = (s: string) => s.replace(/\n/g, '↵')
  return (
    <div className={`${panel} gap-3`} aria-hidden>
      <p className="text-white/40">
        <span className="text-[var(--accent)]">fruits.txt</span> · BUFFER_SIZE={BUFFER}
      </p>
      <p className="flex flex-wrap gap-[2px]">
        {[...FILE].map((c, i) => (
          <span
            key={i}
            className={`grid h-5 w-4 place-items-center rounded-sm transition-colors duration-300 ${
              chunk && i >= chunk[0] && i < chunk[1] ? 'bg-[var(--accent)] text-black' : i < consumed ? 'bg-white/5 text-white/25' : 'bg-white/10 text-white/80'
            }`}
          >
            {c === '\n' ? '↵' : c === ' ' ? '·' : c}
          </span>
        ))}
      </p>
      <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2">
        <p className="text-[10px] uppercase tracking-widest text-white/30">static char *stash</p>
        <p className="min-h-[1.6em] break-all text-amber-300">&quot;{show(stash)}&quot;</p>
      </div>
      <div className="min-h-0 flex-1 space-y-0.5">
        {lines.map((e, i) => (
          <p key={i} className="animate-[demo-in_.35s_ease-out]">
            <span className="text-white/40">get_next_line(fd) →</span> <span className="text-emerald-400">&quot;{e.kind === 'line' && show(e.line)}&quot;</span>
          </p>
        ))}
        {step >= TRACE.length && <p className="text-white/40">get_next_line(fd) → <span className="text-[var(--accent)]">NULL</span></p>}
      </div>
    </div>
  )
}

// ——— Call Me Maybe: a call generated token by token, the grammar striking out what doesn't fit ———

/** '{"name": "fn_greet", "parameters": {"name": "shrek"}}' → 'fn_greet(name="shrek")' */
function asCall(json: string) {
  const { name, parameters } = JSON.parse(json) as { name: string; parameters: Record<string, unknown> }
  const args = Object.entries(parameters).map(([k, v]) => `${k}=${typeof v === 'number' ? v.toFixed(1) : JSON.stringify(v)}`)
  return `${name}(${args.join(', ')})`
}

export function CallMeDemo({ active }: DemoProps) {
  const tick = useTicks(active, 420)
  const runs = useMemo(() => CALLS.map((c, i) => ({ ...c, steps: decode(c.tokens, i) })), [])
  const lengths = runs.map((r) => r.steps.length + 6)
  const cycle = lengths.reduce((a, b) => a + b, 0)
  let at = tick % cycle
  let run = 0
  while (at >= lengths[run]) at -= lengths[run++]
  const { prompt, steps } = runs[run]
  const done = Math.min(at, steps.length)
  const current = steps[Math.min(at, steps.length - 1)]
  const finished = at >= steps.length
  return (
    <div className={`${panel} gap-3`} aria-hidden>
      <p className="self-end rounded-2xl rounded-br-sm bg-[var(--accent)] px-3 py-1.5 font-sans text-sm text-black">{prompt}</p>
      <p className="text-white/40">
        Qwen3-0.6B <span className="text-white/25">· constrained to functions_definition.json</span>
      </p>
      <div className="min-h-[5.5em] rounded-lg border border-white/10 bg-black/40 p-3 break-all text-amber-300">
        {steps.slice(0, done).map((s) => s.chosen).join('')}
        {!finished && <span className="animate-pulse text-[var(--accent)]">▌</span>}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-white/30">{finished ? 'valid call ✓' : 'next token'}</p>
        {!finished && (
          <ul className="flex flex-wrap gap-1.5">
            {current.candidates.map((c, i) => (
              <li
                key={`${at}-${i}`}
                className={`rounded px-1.5 py-0.5 whitespace-pre ${
                  i === 0 ? 'bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-400/60' : c.allowed ? 'bg-white/10 text-white/60' : 'bg-red-500/10 text-red-400/80'
                }`}
              >
                <span className={c.allowed ? '' : 'line-through'}>{JSON.stringify(c.token).slice(1, -1)}</span>
                {!c.allowed && <span className="ml-1 text-[9px] text-red-400/60">masked</span>}
              </li>
            ))}
          </ul>
        )}
        {finished && <p className="text-emerald-400">→ {asCall(runs[run].tokens.join(''))}</p>}
      </div>
    </div>
  )
}
