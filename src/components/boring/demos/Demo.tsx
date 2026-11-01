import type { DemoId } from '../../../content/portfolio'
import { MazeDemo, PushSwapDemo } from './CanvasDemos'
import { DescentDemo, TimeboundDemo } from './SideDemos'
import { CallMeDemo, GnlDemo, LibftDemo, PrintfDemo } from './TextDemos'

const DEMOS: Record<DemoId, (p: { active: boolean }) => React.JSX.Element> = {
  libft: LibftDemo,
  printf: PrintfDemo,
  gnl: GnlDemo,
  pushSwap: PushSwapDemo,
  timebound: TimeboundDemo,
  maze: MazeDemo,
  callMe: CallMeDemo,
  descent: DescentDemo,
}

/** A project's live animation (each one generated from its repo). Runs only while `active`. */
export function Demo({ id, active }: { id: DemoId; active: boolean }) {
  const Show = DEMOS[id]
  return <Show active={active} />
}
