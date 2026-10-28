/**
 * The Customer Satisfaction Survey ("3 quick questions"): about a hundred questions about Daniel, in every kind of
 * 2000s web-form control, with interruptions. Pure logic here; the questions are in content/survey.ts and the page
 * is routes/Survey.tsx.
 */

export type Question =
  | { id: string; kind: 'choice'; q: string; a: string[] }
  /** A 1–10 slider that only ever says 10. */
  | { id: string; kind: 'scale'; q: string }
  /** Checkboxes; the `locked` ones re-tick themselves. */
  | { id: string; kind: 'checks'; q: string; options: { label: string; locked?: boolean }[] }
  /** A text box possessed by Daniel (see possess). */
  | { id: string; kind: 'text'; q: string }
  | { id: string; kind: 'select'; q: string; options: string[] }
  /** Yes/No, where No runs away until it gives up (see fleeGivesUp). */
  | { id: string; kind: 'flee'; q: string; yes: string; no: string }

export type Interrupt = { id: string; kind: 'interrupt'; variant: 'expired' | 'captcha' | 'ad' }
export type SurveyStep = Question | Interrupt

export type SurveyProgress = { step: number; answers: Record<string, string> }
export const NEW_SURVEY: SurveyProgress = { step: 0, answers: {} }

/** An interruption after every this-many questions (never after the last one). */
export const INTERRUPT_EVERY = 10
const VARIANTS: Interrupt['variant'][] = ['expired', 'captcha', 'ad']

/** The questions with an interruption after every 10th, taking turns: session expired, captcha, ad break. */
export function withInterrupts(questions: Question[]): SurveyStep[] {
  const steps: SurveyStep[] = []
  questions.forEach((q, i) => {
    steps.push(q)
    const n = i + 1
    if (n % INTERRUPT_EVERY === 0 && n < questions.length) {
      const k = n / INTERRUPT_EVERY - 1
      steps.push({ id: `interrupt-${k + 1}`, kind: 'interrupt', variant: VARIANTS[k % VARIANTS.length] })
    }
  })
  return steps
}

/** Which question number a step is (interruptions don't count; they show the number of the next question). */
export const questionNumber = (steps: SurveyStep[], step: number) => steps.slice(0, step).filter((s) => s.kind !== 'interrupt').length + 1

/** "Only 3 questions!": the total claims to be 3 until you pass it, then it's always just this one. */
export const claimedTotal = (n: number) => Math.max(3, n)

/** No gives up running away after this many escapes and turns into a Yes. */
export const FLEE_ESCAPES = 3
export const fleeGivesUp = (escapes: number) => escapes >= FLEE_ESCAPES

/** The possessed text box: whatever you type, it comes out as this many letters of "Daniel Daniel Daniel…". */
export const possess = (length: number) => 'Daniel '.repeat(Math.ceil(length / 7) + 1).slice(0, length)

/** The results page's headline questions, and the answer everyone else gave (all of them, every time). */
export const HEADLINES = [
  { id: 'rate', label: 'How much do you like Daniel? (10 to 10)', everyone: '10' },
  { id: 'recommend', label: 'Would you recommend Daniel?', everyone: 'Yes, to all of them' },
  { id: 'like', label: 'Do you like Daniel?', everyone: 'Definitely yes' },
  { id: 'friend', label: "Would you like to be Daniel's friend?", everyone: 'Yes' },
  { id: 'forever', label: 'Will you like Daniel forever?', everyone: 'Even after the website goes down' },
] as const

export type ResultRow = { id: string; label: string; you: string; everyone: string; agree: boolean }

/** Your answers next to everyone else's (everyone else: 100% the most pro-Daniel answer). */
export const resultRows = (answers: Record<string, string>): ResultRow[] =>
  HEADLINES.map((h) => {
    const you = answers[h.id] ?? '(no answer)'
    return { id: h.id, label: h.label, you, everyone: h.everyone, agree: you === h.everyone }
  })
