// Sealed content: things the hunt hides behind an answer (a locked folder's files, a page at a secret address).
// Each one is AES-GCM encrypted with a key derived from its answer, so the answer and what it opens never appear in
// the bundle or the repo. The plaintext lives in the gitignored secrets/ folder; `npm run seal` (scripts/seal.mjs)
// writes src/sealed/hunt.json. A wrong answer simply fails GCM's check: there's no stored hash to compare against.

export type Seal = { salt: string; iv: string; data: string }

/** Must match scripts/seal.mjs. Slow on purpose: guessing has to cost something. */
export const SEAL_ITERATIONS = 200_000

/** Case, extra spaces and a trailing slash don't matter: "  Open  SESAME " opens "open sesame". */
export const normalise = (answer: string) => answer.trim().toLowerCase().replace(/\s+/g, ' ').replace(/(.)\/+$/, '$1')

const bytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
const b64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)))

async function deriveKey(answer: string, salt: Uint8Array, usage: KeyUsage[]) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(normalise(answer)), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: SEAL_ITERATIONS }, base, { name: 'AES-GCM', length: 256 }, false, usage)
}

/** The sealed value, or null if the answer is wrong (or the seal is damaged). */
export async function openSeal<T>(seal: Seal, answer: string): Promise<T | null> {
  try {
    const key = await deriveKey(answer, bytes(seal.salt), ['decrypt'])
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(seal.iv) as BufferSource }, key, bytes(seal.data) as BufferSource)
    return JSON.parse(new TextDecoder().decode(plain)) as T
  } catch {
    return null
  }
}

/** The same as scripts/seal.mjs does, for tests that seal a fixture. */
export async function makeSeal(value: unknown, answer: string): Promise<Seal> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(answer, salt, ['encrypt'])
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(value)))
  return { salt: b64(salt), iv: b64(iv), data: b64(data) }
}
