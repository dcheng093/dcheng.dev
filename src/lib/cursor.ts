/** SVG-emoji cursor; works in Chromium/Firefox/Safari, falls back to the default arrow. */
export const emojiCursor = (emoji: string) =>
  `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><text y='26' font-size='26'>${encodeURIComponent(emoji)}</text></svg>") 4 4, auto`
