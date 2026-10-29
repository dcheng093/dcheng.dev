import { Chiptune } from './synth'
import { findTrack, type MixId } from './tracks'

/** Plays either kind of track through the same master gain, so mute and /boring's silence cover both. */
export class MusicPlayer {
  private chiptune: Chiptune
  private ctx: AudioContext
  private dest: AudioNode
  private el: HTMLAudioElement | null = null
  private loaded: MixId | null = null

  constructor(ctx: AudioContext, dest: AudioNode) {
    this.ctx = ctx
    this.dest = dest
    this.chiptune = new Chiptune(ctx, dest)
  }

  /** `warped`: the possessed site plays everything slower and lower. */
  start(id: MixId, warped = false) {
    this.stop()
    const track = findTrack(id)
    if (track.kind === 'synth') return this.chiptune.start(track.song, warped)
    const el = this.audio()
    // Same file as last time (e.g. back from /boring): resume where it paused instead of restarting.
    if (this.loaded !== track.id) el.src = track.url
    this.loaded = track.id
    el.preservesPitch = !warped
    el.playbackRate = warped ? 0.75 : 1
    void el.play().catch(() => {})
  }

  stop() {
    this.chiptune.stop()
    this.el?.pause()
  }

  private audio() {
    if (!this.el) {
      this.el = new Audio()
      this.el.loop = true
      this.ctx.createMediaElementSource(this.el).connect(this.dest)
    }
    return this.el
  }
}
