import { MazeDemo, PushSwapDemo } from './CanvasDemos'
import { CallMeDemo, GnlDemo, LibftDemo, PrintfDemo } from './TextDemos'

export type DemoId = 'libft' | 'printf' | 'gnl' | 'pushSwap' | 'maze' | 'callMe'

const DEMOS: Record<DemoId, (p: { active: boolean }) => React.JSX.Element> = {
  libft: LibftDemo,
  printf: PrintfDemo,
  gnl: GnlDemo,
  pushSwap: PushSwapDemo,
  maze: MazeDemo,
  callMe: CallMeDemo,
}

/** A project's live animation (each one generated from its repo). Runs only while `active`. */
export function Demo({ id, active }: { id: DemoId; active: boolean }) {
  const Show = DEMOS[id]
  return <Show active={active} />
}
