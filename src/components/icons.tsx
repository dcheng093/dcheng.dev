// Brand and UI marks as inline SVG (no icon font, no emoji: some systems have neither).

type IconProps = { size?: number; className?: string }

const svg = (path: string) =>
  function Icon({ size = 18, className }: IconProps) {
    return (
      <svg aria-hidden viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
        <path d={path} />
      </svg>
    )
  }

export const DiscordIcon = svg(
  'M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.4 18.4 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18.1a19.9 19.9 0 0 0 6 3l1.3-2.1a12.9 12.9 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4a13 13 0 0 1-2 1l1.3 2.1a19.8 19.8 0 0 0 6-3c.5-5.2-.9-9.7-3.6-13.7ZM8.3 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm7.4 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z',
)
export const GitHubIcon = svg(
  'M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z',
)
export const MailIcon = svg(
  'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.2L4.4 7H4v.9l8 5.4 8-5.4V7h-.4L12 12.2Z',
)
export const ChevronUpIcon = svg('M12 6.6 4.3 14.3l1.4 1.4L12 9.4l6.3 6.3 1.4-1.4L12 6.6Zm0 5L4.3 19.3l1.4 1.4 6.3-6.3 6.3 6.3 1.4-1.4L12 11.6Z')
export const ArrowIcon = svg('M13.2 5.3 19.9 12l-6.7 6.7-1.4-1.4 4.3-4.3H4v-2h12.1l-4.3-4.3 1.4-1.4Z')
export const MenuIcon = svg('M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z')
export const YouTubeIcon = svg(
  'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8ZM9.5 15.6V8.4l6.3 3.6-6.3 3.6Z',
)
export const TwitchIcon = svg(
  'M11.6 4.7h1.7v5.1h-1.7V4.7Zm4.7 0H18v5.1h-1.7V4.7ZM6 0 1.7 4.3v15.4h5.2V24l4.2-4.3h3.5L22.3 12V0H6Zm14.6 11.1-3.4 3.5h-3.5l-3 3v-3H6.9V1.7h13.7v9.4Z',
)
export const SoundCloudIcon = svg(
  'M1 14h1.2v4H1v-4Zm2.4-2h1.2v6H3.4v-6Zm2.4-1H7v7H5.8v-7Zm2.4-1h1.2v8H8.2v-8Zm2.4-2h1.2v10h-1.2V8Zm2.4.6a5.2 5.2 0 0 1 8.4 2.6 3.5 3.5 0 0 1-.4 7H13V8.6Z',
)
