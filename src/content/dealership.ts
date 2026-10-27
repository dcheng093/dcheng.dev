import type { AdTarget } from './ads'

export type Model = { name: string; tagline: string; price: string; initial: string; to: AdTarget; hot?: boolean }

export const models: Model[] = [
  { name: 'Daniel Stoner', tagline: 'Constantly blazed out of his mind.', price: '£69', initial: '£0.01', to: '/checkout', hot: true },
  { name: 'Daniel', tagline: 'undefined.', price: '£42', initial: '£42', to: '/shrine/segfault' },
  { name: 'Daniel Washee Washee', tagline: 'Smells strongly of laundry detergent.', price: '£420', initial: '£999', to: '/checkout', hot: true },
  { name: 'Daniel Night', tagline: '"Had a bad dream?"', price: '£9.99', initial: '£0', to: '/checkout' },
  { name: 'Daniel Giant', tagline: 'Looks down at you menacingly.', price: '£88', initial: '£88', to: '/you-won' },
  { name: 'Daniel Enlightened', tagline: 'He has not been the same since.', price: '£120', initial: '£5', to: '/shrine/horses' },
  { name: 'Daniel EatsAlot', tagline: 'The all-you-can-eat buffet was not all-you-can-eat.', price: '£199', initial: '£1', to: '/checkout' },
  { name: 'Daniel Chase', tagline: 'Run', price: '£55', initial: '£0.50', to: '/under-construction' },
  { name: 'Daniel Gonzalez', tagline: 'Arrives fashionably late.', price: '£101', initial: '£10', to: '/shrine/push-swap', hot: true },
  { name: 'Daniel Sleepy', tagline: 'A very sleepy man', price: '£29', initial: '£2', to: '/checkout' },
  { name: 'Daniel Stare', tagline: 'Will stare at you.', price: '£75', initial: '£15', to: '/guestbook' },
  { name: 'Daniel Hybrid', tagline: 'Half Python, half C.', price: '£999', initial: '£999', to: 'random' },
]

export const brands = ['Daniel', 'Danny', 'Dan', 'D-Money', 'The Danster', 'Señor Daniel', 'Dan the Man', 'Daniel™', 'Mr. Cheng', 'DC-3000']

export const pressClippings = [
  { paper: 'The Daily Segfault', headline: 'LOCAL MAN LEASES HIMSELF', quote: '“He is very cheap,” said nobody.' },
  { paper: 'Kettle Weekly', headline: 'DANIEL NAMED KETTLE OF THE YEAR', quote: 'Organisers confirm he is not a kettle.' },
  { paper: 'The Horse Gazette', headline: 'NEIGH', quote: 'Neigh neigh. Neigh. — The Horses' },
]

export const testimonials = [
  { who: 'Mrs. P., Leeds-ish', text: 'I leased a Daniel Chase and now he lives in my spare room. Five stars.' },
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
  'fear',
]
