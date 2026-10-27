import type { AdTarget } from './ads'

export type Model = { name: string; tagline: string; price: string; initial: string; to: AdTarget; hot?: boolean }

export const models: Model[] = [
  { name: 'Daniel 2003', tagline: 'Original model. Factory settings.', price: '£69', initial: '£0.01', to: '/checkout', hot: true },
  { name: 'Daniel Piscine Edition', tagline: '4 weeks of C. Runs on coffee.', price: '£42', initial: '£42', to: '/shrine/segfault' },
  { name: 'Daniel Sport', tagline: 'Spoiler included (it’s the ending).', price: '£420', initial: '£999', to: '/checkout', hot: true },
  { name: 'Daniel (Refurbished)', tagline: 'Like new. Is not new.', price: '£9.99', initial: '£0', to: '/checkout' },
  { name: 'Daniel Turbo GT', tagline: 'Types at 140 WPM. Mostly typos.', price: '£88', initial: '£88', to: '/you-won' },
  { name: 'Daniel Estate', tagline: 'Room for 5 horses.', price: '£120', initial: '£5', to: '/shrine/horses' },
  { name: 'Daniel Convertible', tagline: 'Top down. Morale up.', price: '£199', initial: '£1', to: '/checkout' },
  { name: 'Daniel Diesel', tagline: 'Old, loud, reliable.', price: '£55', initial: '£0.50', to: '/under-construction' },
  { name: 'Daniel Hybrid', tagline: 'Half Python, half C.', price: '£101', initial: '£10', to: '/shrine/push-swap', hot: true },
  { name: 'Daniel Mini', tagline: 'Fun size. Same opinions.', price: '£29', initial: '£2', to: '/checkout' },
  { name: 'Daniel Pickup', tagline: 'Will help you move (once).', price: '£75', initial: '£15', to: '/guestbook' },
  { name: 'Daniel Limo', tagline: 'Arrives fashionably late.', price: '£999', initial: '£999', to: 'random' },
]

export const brands = ['Daniel', 'Danny', 'Dan', 'D-Money', 'The Danster', 'Señor Daniel', 'Dan the Man', 'Daniel™', 'Mr. Cheng', 'DC-3000']

export const pressClippings = [
  { paper: 'The Daily Segfault', headline: 'LOCAL MAN LEASES HIMSELF', quote: '“He is very cheap,” said nobody.' },
  { paper: 'Kettle Weekly', headline: 'DANIEL NAMED KETTLE OF THE YEAR', quote: 'Organisers confirm he is not a kettle.' },
  { paper: 'The Horse Gazette', headline: 'NEIGH', quote: 'Neigh neigh. Neigh. — The Horses' },
]

export const testimonials = [
  { who: 'Mrs. P., Leeds-ish', text: 'I leased a Daniel and now he lives in my spare room. Five stars.' },
  { who: 'A Horse', text: 'Neigh!!!' },
  { who: 'The Norminette', text: 'Error: TESTIMONIAL_TOO_LONG' },
  { who: 'Anonymous', text: 'Better than a used car. Slightly worse than a new car.' },
]

export const howItWorks = [
  'Choose a Daniel from the left hand menu',
  'Click ORDER NOW (it will not work)',
  'Fill in the form (it will not save)',
  'Wait 3–5 business years',
  'Daniel arrives (he walked)',
  'Return Daniel in original packaging',
]
