// Ports of two of Daniel's C projects, close enough to replay what they do step by step.

/** One stretch of a printf format: literal text, or a conversion and what it printed. */
export type PrintfPiece = { src: string; out: string; conv: boolean }

const HEX_LOW = '0123456789abcdef'
const HEX_UP = '0123456789ABCDEF'
const hex = (n: number, base: string) => {
  if (n === 0) return '0'
  let s = ''
  for (; n > 0; n = Math.floor(n / 16)) s = base[n % 16] + s
  return s
}

/**
 * ft_printf (github.com/dcheng093/Printf): %c %s %p %d %i %u %x %X %%. A null string prints "(null)" and a null
 * pointer "(nil)"; ints wrap like C's when shown unsigned. Arguments are taken in order, as va_arg would.
 */
export function ftPrintf(format: string, args: (string | number | null)[]): PrintfPiece[] {
  const pieces: PrintfPiece[] = []
  let literal = ''
  let next = 0
  const u32 = (n: number) => n >>> 0
  for (let i = 0; i < format.length; i++) {
    if (format[i] !== '%') {
      literal += format[i]
      continue
    }
    if (literal) pieces.push({ src: literal, out: literal, conv: false })
    literal = ''
    const c = format[++i]
    const arg = c === '%' ? null : args[next++]
    let out = ''
    if (c === 'c') out = String.fromCharCode(Number(arg))
    else if (c === 's') out = arg === null ? '(null)' : String(arg)
    else if (c === 'd' || c === 'i') out = String(Math.trunc(Number(arg)) | 0)
    else if (c === 'u') out = String(u32(Number(arg)))
    else if (c === 'p') out = arg === null || arg === 0 ? '(nil)' : `0x${hex(Number(arg), HEX_LOW)}`
    else if (c === 'x') out = hex(u32(Number(arg)), HEX_LOW)
    else if (c === 'X') out = hex(u32(Number(arg)), HEX_UP)
    else if (c === '%') out = '%'
    pieces.push({ src: `%${c}`, out, conv: true })
  }
  if (literal) pieces.push({ src: literal, out: literal, conv: false })
  return pieces
}

/** What get_next_line did: a read() of up to BUFFER_SIZE bytes into the stash, or a line handed back from it. */
export type GnlEvent = { kind: 'read'; at: number; bytes: string; stash: string } | { kind: 'line'; line: string; stash: string }

/**
 * get_next_line (github.com/dcheng093/get_next_line), called until it returns NULL. Keeps its quirk: the stash is
 * checked for a newline from its second character, so a line that starts the stash with "\n" waits for one more read.
 */
export function gnlTrace(file: string, bufferSize: number): GnlEvent[] {
  const events: GnlEvent[] = []
  let offset = 0
  let prev: string | null = null
  const getLine = () => {
    if (!prev) {
      prev = null
      return null
    }
    const nl = prev.indexOf('\n')
    const end = nl === -1 ? prev.length : nl + 1
    const line = prev.slice(0, end)
    prev = prev.slice(end)
    return line
  }
  for (;;) {
    let line: string | null
    for (let bytes = 1; ; ) {
      if (prev && prev.indexOf('\n', 1) !== -1) {
        line = getLine()
        break
      }
      if (!bytes) {
        line = getLine()
        break
      }
      const chunk = file.slice(offset, offset + bufferSize)
      bytes = chunk.length
      if (bytes) {
        events.push({ kind: 'read', at: offset, bytes: chunk, stash: (prev ?? '') + chunk })
        offset += bytes
      }
      prev = (prev ?? '') + chunk
    }
    if (line === null) return events
    events.push({ kind: 'line', line, stash: prev ?? '' })
  }
}
