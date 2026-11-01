import { useEffect, useState } from 'react'

/** Copies text to the clipboard; `copied` is true for a moment afterwards (for a "copied!" flash). */
export function useCopy(ms = 1600) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), ms)
    return () => window.clearTimeout(id)
  }, [copied, ms])
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // No clipboard API (old browser, insecure context): the old way, through a hidden text box.
      const box = document.createElement('textarea')
      box.value = text
      box.style.position = 'fixed'
      box.style.opacity = '0'
      document.body.append(box)
      box.select()
      document.execCommand('copy')
      box.remove()
    }
    setCopied(true)
  }
  return { copied, copy }
}
