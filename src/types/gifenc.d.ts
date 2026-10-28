// gifenc ships no types; just the three calls the blinkie maker uses.
declare module 'gifenc' {
  type Palette = number[][]
  export function quantize(rgba: Uint8ClampedArray | Uint8Array, maxColors: number, opts?: { format?: 'rgb565' | 'rgb444' | 'rgba4444' }): Palette
  export function applyPalette(rgba: Uint8ClampedArray | Uint8Array, palette: Palette, format?: 'rgb565' | 'rgb444' | 'rgba4444'): Uint8Array
  export function GIFEncoder(): {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: { palette?: Palette; delay?: number; repeat?: number; transparent?: boolean }): void
    finish(): void
    bytes(): Uint8Array
  }
}
