import { useEffect } from 'react'
import { possessedText } from '../../lib/rot'

/** Text that stays itself: readable areas, form fields, and things that redraw too often (or rot themselves). */
const KEEP = '[data-uncorrupted], [data-no-rot], script, style, textarea, input, select, option, [contenteditable]'

/**
 * While mounted (the site is possessed), every piece of visible text on the page says its possessed version instead:
 * a hand-written line, or its rot (src/lib/rot.ts). Works on the live DOM, so it reaches every page without each one
 * knowing; React rewriting a node just gets it rotted again. Batched to one pass per frame. Unmounting (baptism)
 * puts every original back.
 */
export function TextRot() {
  useEffect(() => {
    const original = new WeakMap<Text, string>()
    const ours = new WeakMap<Text, string>()
    const touched = new Set<Text>()

    const treat = (t: Text) => {
      const value = t.nodeValue ?? ''
      if (ours.get(t) === value || !value.trim()) return // our own write, or nothing to say
      if (!t.parentElement || t.parentElement.closest(KEEP)) return
      const next = possessedText(value)
      if (next === value) return
      original.set(t, value)
      ours.set(t, next)
      touched.add(t)
      t.nodeValue = next
    }
    const visit = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) return treat(node as Text)
      if (node.nodeType !== Node.ELEMENT_NODE || (node as Element).closest(KEEP)) return
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
      for (let t = walker.nextNode(); t; t = walker.nextNode()) treat(t as Text)
    }

    const pending = new Set<Node>()
    let frame = 0
    const flush = () => {
      frame = 0
      pending.forEach(visit)
      pending.clear()
    }
    const observer = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'characterData') pending.add(r.target)
        else r.addedNodes.forEach((n) => pending.add(n))
      }
      if (!frame) frame = requestAnimationFrame(flush)
    })
    visit(document.body)
    observer.observe(document.body, { subtree: true, childList: true, characterData: true })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      // Baptized: everything says what it said before (unless React has since rewritten it anyway).
      for (const t of touched) if (t.nodeValue === ours.get(t)) t.nodeValue = original.get(t) ?? t.nodeValue
    }
  }, [])
  return null
}
