import { Haunting } from './Haunting'
import { JumpScare } from './JumpScare'
import { Possession } from './Possession'
import { TextRot } from './TextRot'

/**
 * Everything the possessed site adds on top of the page, in one piece that only loads once a visitor is possessed
 * (RootLayout): most never are, so none of it is in their download. `rot` off (the secret page) leaves the words
 * alone: TextRot puts every original back as it goes, and picks up again on the next page.
 */
export function PossessedLayer({ haunt, paused, rot }: { haunt: boolean; paused: boolean; rot: boolean }) {
  return (
    <>
      <Possession />
      {rot && <TextRot />}
      {haunt && <Haunting paused={paused} />}
      <JumpScare />
    </>
  )
}
