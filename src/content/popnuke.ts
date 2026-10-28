import type { ObjSpec } from '../three/pageScenes'

// Words for POPNUKE by Daniel Cheng Software Ltd. Daniel's voice by way of a state software bureau.

const spec = (id: string, name: string, shape: ObjSpec['shape'], lore: string, extra: Partial<ObjSpec> = {}): ObjSpec => ({
  id,
  name,
  lore,
  madeOf: 'POPNUKE',
  shape,
  personality: 'showoff',
  size: 'm',
  role: 'drifter',
  rarity: 'rare',
  ...extra,
})

/** The 3D pieces used on the page and in the ad (not page objects; shown in viewers). */
export const POPNUKE_3D = {
  logo: spec('popnuke-logo', 'The POPNUKE Emblem', 'nukeLogo', 'Neutralises 99.9% of pop-ups. The other 0.1% is this one.'),
  box: spec('popnuke-box', 'POPNUKE 3000 (Retail Box)', 'softwareBox', 'Includes 1 floppy disk and 0 manuals.'),
  spokesDaniel: spec('spokes-daniel', 'Daniel Cheng, CEO', 'head', 'Founder, CEO, and only employee of Daniel Cheng Software Ltd.', { photo: 0 }),
}

export const PRODUCT = {
  name: 'POPNUKE',
  edition: '3000 Professional Edition',
  publisher: 'Daniel Cheng Software Ltd.',
  version: '3.0.0.1',
  tagline: 'NEUTRALISES 99.9% OF POP-UPS*',
  footnote: '*the other 0.1% is our advert',
}

export const SPECS: [string, string][] = [
  ['Version', '3.0.0.1 (final) (final2)'],
  ['File size', '1.44 MB (fits on one floppy, barely)'],
  ['Operating system', 'Windows 95 / 98 / Daniel'],
  ['Licence', 'Soul (non-transferable)'],
  ['Price', 'FREE* (*your soul)'],
  ['Downloads', '7 (4 were Daniel)'],
  ['Last updated', 'Never. It is perfect.'],
]

/** Seals the page is "certified" by. Drawn in code. */
export const SEALS = ['NO VIRUS', 'CERTIFIED BY THE APPROPRIATE BODIES', 'REGIONAL POP-UP COMMENDATION', 'APPROVED FOR CIVILIAN USE']

export const REVIEWS: { who: string; stars: number; text: string }[] = [
  { who: 'Grandma (AOL)', stars: 5, text: 'I INSTALLED IT AND NOW I CANNOT FIND THE POP-UPS. WHERE DID THEY GO. FIVE STARS.' },
  { who: 'A Pop-up', stars: 1, text: 'This product has ruined my career. I used to appear every 14 to 32 seconds.' },
  { who: 'The Norminette', stars: 3, text: 'Error: REVIEW_TOO_SHORT. Works though.' },
  { who: 'A Horse', stars: 5, text: 'Neigh. (Translation: it nuked everything except the horses.)' },
  { who: 'Daniel Cheng, CEO', stars: 5, text: 'As the founder, CEO and only employee, I can confirm it is the best product we make.' },
]

/** Fig. 2 — Customer response, deadpan. */
export const FIGURES = [
  { fig: 'FIG. 1 — THE PROBLEM', text: 'Pop-ups appear every 14 to 32 seconds. Some multiply. Some run away from your mouse.' },
  { fig: 'FIG. 2 — THE SOLUTION', text: 'POPNUKE intercepts each pop-up before it reaches you, and destroys it.' },
  { fig: 'FIG. 3 — CUSTOMER RESPONSE', text: 'Customers report feeling “nothing at all”. This is the intended effect.' },
]

export const EULA = `POPNUKE END USER LICENCE AGREEMENT (EULA)

1. By reading this sentence you have agreed to read the next one.
2. Daniel Cheng Software Ltd. ("Daniel") grants you ("You") a licence to use POPNUKE ("POPNUKE") on one (1) computer, or on more if you do not tell anyone.
3. POPNUKE will remove pop-ups from this web site. It will not remove pop-ups from other web sites, your life, or your heart.
4. You agree that the pop-ups had it coming.
5. Daniel accepts no responsibility for: lost pop-ups, quieter afternoons, an unusual sense of calm, or the horses.
6. POPNUKE is free. In exchange, You give Daniel your soul (non-transferable, non-refundable, held in a kettle).
7. You may uninstall POPNUKE at any time. The pop-ups will know. They will come back angry.
8. This licence is governed by the laws of the Kettle Kingdom.
9. If you have scrolled this far, you are a very careful person. Daniel respects that.
10. Thank you for choosing POPNUKE.

— END OF AGREEMENT —`

export const INSTALL_LOG = [
  'Extracting POPNUKE.EXE…',
  'Locating pop-ups…',
  'Found 6 kinds of pop-up. Found 1 virus (Albanian, harmless).',
  'Neutralising pop-ups…',
  'Reticulating Daniels…',
  'Registering soul with Daniel Cheng Software Ltd.…',
  'Almost done…',
]
