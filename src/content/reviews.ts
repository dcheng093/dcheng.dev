// The Hall of Fame (/reviews): what people have said about the site, as screenshots.
// To add one, drop the image in src/reviews/ and it's on the page. Nothing else to do.
// Optionally give it a NOTES entry below: alt text (what the review says, for screen readers) and an order.

const FILES = import.meta.glob<string>('../reviews/*.{png,jpg,jpeg,webp,gif}', { eager: true, import: 'default' })

/** By file name. `order` sorts lowest first; files without one go after, in name order ("review (2)" before "review (10)"). */
const NOTES: Record<string, { alt?: string; order?: number }> = {
  'review.png': { order: 1, alt: 'SABAAR on Discord: "This is most creative and unique website I have seen so far!!"' },
  'review (1).png': {
    order: 2,
    alt: 'ls- on Discord: "THIS IS SO COOL HAHAHAH WHOA". lanusri-: "i feel liek i could explore for hours and not be done, theres so much random shit"',
  },
  'review (4).png': { order: 3, alt: `bh on Discord: "The 90's are BACK BABY!!!"` },
  'review (6).png': { order: 4, alt: 'jl on Discord: "Fever dream type shi"' },
  'review (3).png': { order: 5, alt: 'A reviewer on Discord: "Sensory overload bro"' },
  'review (5).png': { order: 6, alt: 'jn on Discord: "W site"' },
  'review (2).png': {
    order: 7,
    alt: 'Epicwindow+- on Discord: "the daniel cannot be daniel for the daniel is the daniel not even the daniel can deniel himself"',
  },
}

export type Review = { file: string; src: string; alt: string }

const byName = new Intl.Collator('en', { numeric: true }).compare

export const REVIEWS: Review[] = Object.entries(FILES)
  .map(([path, src]) => {
    const file = path.slice(path.lastIndexOf('/') + 1)
    return { file, src, alt: NOTES[file]?.alt ?? 'A review of this site, from Discord' }
  })
  .sort((a, b) => (NOTES[a.file]?.order ?? Infinity) - (NOTES[b.file]?.order ?? Infinity) || byName(a.file, b.file))
