// The idea behind Daniel's Call Me Maybe (github.com/dcheng093/Call-Me-Maybe): a small model writes a function call
// one token at a time, and a grammar built from the function definitions masks every token that would make the
// output invalid. This is a much smaller grammar than his trie rulebook, but it accepts and rejects the same way.

type Param = 'number' | 'string'

/** data/input/functions_definition.json */
export const FUNCTIONS: { name: string; parameters: Record<string, Param> }[] = [
  { name: 'fn_add_numbers', parameters: { a: 'number', b: 'number' } },
  { name: 'fn_greet', parameters: { name: 'string' } },
  { name: 'fn_reverse_string', parameters: { s: 'string' } },
  { name: 'fn_get_square_root', parameters: { a: 'number' } },
  { name: 'fn_substitute_string_with_regex', parameters: { source_string: 'string', regex: 'string', replacement: 'string' } },
]

type Part = string | Param

/** The shape of a call to `fn`: fixed text with a slot for each parameter's value. */
function template(fn: (typeof FUNCTIONS)[number]): Part[] {
  const parts: Part[] = [`{"name": "${fn.name}", "parameters": {`]
  Object.entries(fn.parameters).forEach(([k, type], i) => {
    parts.push(`${i ? ', ' : ''}"${k}": `, type)
  })
  parts.push('}}')
  return parts
}
const TEMPLATES = FUNCTIONS.map(template)

/** Can `text` still grow into a valid call to some function? (What the mask asks of every candidate token.) */
export function acceptsPrefix(text: string) {
  return TEMPLATES.some((parts) => walk(parts, 0, text, 0))
}

function walk(parts: Part[], p: number, text: string, i: number): boolean {
  if (i === text.length) return true
  if (p === parts.length) return false
  const part = parts[p]
  if (part === 'number') {
    // An optional minus, digits, at most one point; the number ends at the first character that can't continue it.
    const m = /^-?\d*(?:\.\d*)?/.exec(text.slice(i))![0]
    if (i + m.length === text.length) return true
    return /\d$/.test(m) && walk(parts, p + 1, text, i + m.length)
  }
  if (part === 'string') {
    if (text[i] !== '"') return false
    const close = text.indexOf('"', i + 1)
    return close === -1 || walk(parts, p + 1, text, close + 1)
  }
  for (let k = 0; k < part.length; k++, i++) {
    if (i === text.length) return true
    if (text[i] !== part[k]) return false
  }
  return walk(parts, p + 1, text, i)
}

/** One step of generation: the token the model picked, and the other likely tokens, each allowed or masked. */
export type DecodeStep = { chosen: string; candidates: { token: string; allowed: boolean }[] }

// Tokens a small model reaches for when it isn't held to a grammar (chat filler, markdown, wrong names, wrong types).
const TEMPTATIONS = ['Sure', '```', ' The', 'Here', 'function', '_multiply', ' "result', ' two', 'null', '}', ' sum', '\n', ' 5', '_greet', '"', ' {"']

/**
 * Replays a call being generated token by token. `tokens` is how the model split its answer; each step shows two or
 * three tempting alternatives, checked against the grammar exactly as the chosen token is.
 */
export function decode(tokens: string[], seed = 0): DecodeStep[] {
  let text = ''
  return tokens.map((chosen, i) => {
    const pool = TEMPTATIONS.filter((t) => t !== chosen)
    const picks: string[] = []
    for (let k = 0; picks.length < 3 && k < pool.length; k++) {
      const t = pool[(i * 5 + seed * 3 + k * 7) % pool.length]
      if (!picks.includes(t)) picks.push(t)
    }
    const candidates = [chosen, ...picks].map((token) => ({ token, allowed: acceptsPrefix(text + token) }))
    text += chosen
    return { chosen, candidates }
  })
}

/** The demo's two requests, from data/input/function_calling_tests.json, and how the model's answers tokenise. */
export const CALLS = [
  {
    prompt: 'What is the sum of 2 and 3?',
    tokens: ['{"', 'name', '":', ' "', 'fn', '_add', '_numbers', '",', ' "', 'parameters', '":', ' {"', 'a', '":', ' ', '2', '.', '0', ',', ' "', 'b', '":', ' ', '3', '.', '0', '}}'],
  },
  {
    prompt: 'Greet shrek',
    tokens: ['{"', 'name', '":', ' "', 'fn', '_greet', '",', ' "', 'parameters', '":', ' {"', 'name', '":', ' "', 'sh', 'rek', '"', '}}'],
  },
]
