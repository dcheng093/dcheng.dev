import { useDescended, useHeardAt, usePossessed } from '../lib/possession'
import { SYNTH_SONGS, type SynthSong } from './synth'

/** Everything the jukebox can play: the built-in synth songs, then any audio files dropped into src/music/. */
export type Track = { id: string; label: string } & ({ kind: 'synth'; song: SynthSong } | { kind: 'file'; url: string })
export type MixId = string

// Found at build time, so adding a song is: drop the file in src/music/, rebuild.
const files = import.meta.glob<string>('../music/*.{mp3,ogg,m4a}', { eager: true, query: '?url', import: 'default' })

/** "daniel-theme_v2.mp3" -> "Daniel Theme V2" */
export const fileLabel = (path: string) =>
  (path.split('/').pop() ?? path)
    .replace(/\.[^.]+$/, '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')

export const MIXES: Track[] = [
  ...SYNTH_SONGS.map((song): Track => ({ id: song.id, label: song.label, kind: 'synth', song })),
  ...Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, url]): Track => ({ id: `file:${path.split('/').pop()}`, label: fileLabel(path), kind: 'file', url })),
]

/** Unknown ids (e.g. a stored pick whose file was since removed) fall back to the first track. */
export const findTrack = (id: MixId) => MIXES.find((t) => t.id === id) ?? MIXES[0]

/**
 * The tracks this visitor can see. Possessed: only the possessed songs, the hymn, and Daniel's own recordings (played
 * warped). Otherwise: everything but those, with hidden songs (the hymn) joining once they've reached a sealed page.
 */
export function visibleMixes(heard: boolean, possessed = false, descended = false) {
  const finished = (t: Track) => t.kind === 'file' || !t.song.finisher || descended
  if (possessed) return MIXES.filter((t) => t.kind === 'file' || t.song.possessed || t.id === 'hymn' || (descended && t.song.finisher))
  return MIXES.filter((t) => finished(t) && (t.kind === 'file' || (!t.song.possessed && (heard || !t.song.hidden))))
}
export const useMixes = () => visibleMixes(!!useHeardAt(), usePossessed(), !!useDescended())
