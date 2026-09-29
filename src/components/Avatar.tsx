import { AVATARS } from '../data/avatars'

interface Props {
  id: string
  size?: number
}

/** Decorative by default: the name next to it carries the meaning. */
export function Avatar({ id, size = 36 }: Props) {
  const def = AVATARS.find((a) => a.id === id) ?? AVATARS[0]
  const dark = def.tone === 'dark'
  const bg = dark ? '#0A0A0A' : '#EFEFEF'
  const fg = dark ? '#FFFFFF' : '#0A0A0A'
  return (
    <svg
      className="avatar"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={`avatar-clip-${def.id}`}>
          <circle cx="24" cy="24" r="24" />
        </clipPath>
      </defs>
      <circle cx="24" cy="24" r="24" fill={bg} />
      <g clipPath={`url(#avatar-clip-${def.id})`}>{def.art(bg, fg)}</g>
      <circle cx="24" cy="24" r="23.25" fill="none" stroke="#0A0A0A" strokeWidth="1.5" />
    </svg>
  )
}
