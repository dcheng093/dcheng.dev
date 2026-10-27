import { useAudio } from '../audio/audioContext'
import { daniel } from '../content/daniel'
import { Blink, RainbowText } from './chaos/Chaos'
import { Img } from './media/Img'

/** Full-screen splash; the click doubles as the user gesture that unlocks audio. */
export function EnterGate({ onEnter }: { onEnter: () => void }) {
  const { unlock } = useAudio()
  const enter = () => {
    unlock()
    onEnter()
  }
  return (
    <div className="tile-stars fixed inset-0 z-[100] grid place-items-center overflow-y-auto p-4" role="dialog" aria-label="Enter the site">
      <div className="flex max-w-xl flex-col items-center gap-4 text-center">
        <div className="[perspective:400px]">
          <Img slot="headGrin" width={140} className="animate-spin-y" />
        </div>
        <h1 className="wordart text-4xl leading-none sm:text-6xl">{daniel.siteTitle}</h1>
        <p className="font-pixel text-[10px] leading-relaxed text-white sm:text-xs">
          BEST VIEWED IN NETSCRAPE NAVIGATOR 4.0 AT 800×600 WITH SPEAKERS ON
        </p>
        <button
          type="button"
          onClick={enter}
          className="win-raised animate-pulse-scale px-6 py-3 font-impact text-2xl text-black active:[border-color:#404040_#fff_#fff_#404040]"
        >
          <RainbowText text="CLICK HERE TO ENTER" />
        </button>
        <p className="font-vt text-lg text-yellow-300">
          <Blink>⚠</Blink> FLASHING LIGHTS, LOUD MIDI & POPUPS AHEAD <Blink>⚠</Blink>
        </p>
        <div className="flex items-center gap-2">
          <Img slot="newBadge" />
          <Img slot="ucBar" width={220} />
          <Img slot="newBadge" />
        </div>
      </div>
    </div>
  )
}
