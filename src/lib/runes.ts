/** Elder Futhark runes as strokes on a 10×16 grid (drawn by components/Rune.tsx). */
export const STROKES: Record<string, string> = {
  ᚨ: 'M3 0V16M3 0L8 4M3 5L8 9', // ansuz, A
  ᛚ: 'M3 0V16M3 0L8 5', // laguz, L
  ᛏ: 'M5 0V16M5 0L1 5M5 0L9 5', // tiwaz, T
  ᚺ: 'M2 0V16M8 0V16M2 5L8 10', // hagalaz, H
  ᚹ: 'M3 0V16M3 0L8 4L3 8', // wunjo, W
  ᛊ: 'M8 1L2 6L8 10L2 15', // sowilo, S
  ᛞ: 'M1 1V15M9 1V15M1 1L9 15M9 1L1 15', // dagaz, D
  ᛖ: 'M1 16V0L5 5L9 0V16', // ehwaz, E
  ᚱ: 'M3 0V16M3 0L8 4L3 8L8 16', // raidho, R
  ᛗ: 'M1 16V0M9 16V0M1 0L9 7M9 0L1 7', // mannaz, M
  ᛁ: 'M5 0V16', // isaz, I
  ᚾ: 'M5 0V16M2 6L8 10', // naudiz, N
}

export const hasRuneStrokes = (glyph: string) => glyph in STROKES
