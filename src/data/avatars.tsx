import type { ReactNode } from 'react'

type Tone = 'dark' | 'light'
type Art = (bg: string, fg: string) => ReactNode

interface AvatarDef {
  id: string
  label: string
  tone: Tone
  art: Art
}

/** Twelve monochrome sample avatars, drawn as inline SVG so no image assets are needed. */
export const AVATARS: AvatarDef[] = [
  {
    id: 'cat',
    label: 'Cat',
    tone: 'dark',
    art: (bg, fg) => (
      <>
        <polygon points="9,22 11,6 22,14" fill={fg} />
        <polygon points="39,22 37,6 26,14" fill={fg} />
        <ellipse cx="24" cy="28" rx="15" ry="13" fill={fg} />
        <circle cx="18.5" cy="26" r="2" fill={bg} />
        <circle cx="29.5" cy="26" r="2" fill={bg} />
        <polygon points="22,31 26,31 24,33.5" fill={bg} />
        <path d="M13 31 L19 32 M13 35 L19 34 M35 31 L29 32 M35 35 L29 34" stroke={bg} strokeWidth="1" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'fox',
    label: 'Fox',
    tone: 'light',
    art: (bg, fg) => (
      <>
        <polygon points="9,8 22,17 10,26" fill={fg} />
        <polygon points="39,8 26,17 38,26" fill={fg} />
        <polygon points="9,19 24,15 39,19 33,35 24,42 15,35" fill={fg} />
        <polygon points="15,24 20,26 16,28.5" fill={bg} />
        <polygon points="33,24 28,26 32,28.5" fill={bg} />
        <circle cx="24" cy="37.5" r="2.2" fill={bg} />
      </>
    ),
  },
  {
    id: 'owl',
    label: 'Owl',
    tone: 'dark',
    art: (bg, fg) => (
      <>
        <polygon points="10,9 19,15 11,21" fill={fg} />
        <polygon points="38,9 29,15 37,21" fill={fg} />
        <ellipse cx="24" cy="27" rx="15" ry="15" fill={fg} />
        <circle cx="17" cy="25" r="6.5" fill={bg} />
        <circle cx="31" cy="25" r="6.5" fill={bg} />
        <circle cx="17" cy="25" r="2.6" fill={fg} />
        <circle cx="31" cy="25" r="2.6" fill={fg} />
        <polygon points="21.5,30.5 26.5,30.5 24,36" fill={bg} />
      </>
    ),
  },
  {
    id: 'bear',
    label: 'Bear',
    tone: 'light',
    art: (bg, fg) => (
      <>
        <circle cx="11" cy="12" r="6" fill={fg} />
        <circle cx="37" cy="12" r="6" fill={fg} />
        <circle cx="24" cy="27" r="15" fill={fg} />
        <ellipse cx="24" cy="32" rx="7" ry="5.5" fill={bg} />
        <ellipse cx="24" cy="30" rx="2.6" ry="1.8" fill={fg} />
        <circle cx="17.5" cy="23" r="1.9" fill={bg} />
        <circle cx="30.5" cy="23" r="1.9" fill={bg} />
      </>
    ),
  },
  {
    id: 'robot',
    label: 'Robot',
    tone: 'dark',
    art: (bg, fg) => (
      <>
        <line x1="24" y1="7" x2="24" y2="14" stroke={fg} strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="6.5" r="2.5" fill={fg} />
        <rect x="5" y="22" width="4" height="10" rx="1.5" fill={fg} />
        <rect x="39" y="22" width="4" height="10" rx="1.5" fill={fg} />
        <rect x="9" y="13" width="30" height="27" rx="6" fill={fg} />
        <rect x="14.5" y="21" width="6" height="6" rx="1" fill={bg} />
        <rect x="27.5" y="21" width="6" height="6" rx="1" fill={bg} />
        <path d="M17 34h14" stroke={bg} strokeWidth="2" strokeLinecap="round" strokeDasharray="0.1 4" />
      </>
    ),
  },
  {
    id: 'rabbit',
    label: 'Rabbit',
    tone: 'light',
    art: (bg, fg) => (
      <>
        <ellipse cx="17" cy="13" rx="4" ry="10" fill={fg} />
        <ellipse cx="31" cy="13" rx="4" ry="10" fill={fg} />
        <ellipse cx="17" cy="14" rx="1.5" ry="6" fill={bg} />
        <ellipse cx="31" cy="14" rx="1.5" ry="6" fill={bg} />
        <circle cx="24" cy="31" r="12.5" fill={fg} />
        <circle cx="19.5" cy="29" r="1.8" fill={bg} />
        <circle cx="28.5" cy="29" r="1.8" fill={bg} />
        <ellipse cx="24" cy="34" rx="2" ry="1.5" fill={bg} />
      </>
    ),
  },
  {
    id: 'frog',
    label: 'Frog',
    tone: 'dark',
    art: (bg, fg) => (
      <>
        <ellipse cx="24" cy="30" rx="16" ry="12" fill={fg} />
        <circle cx="15" cy="17" r="7" fill={fg} />
        <circle cx="33" cy="17" r="7" fill={fg} />
        <circle cx="15" cy="17" r="3.8" fill={bg} />
        <circle cx="33" cy="17" r="3.8" fill={bg} />
        <circle cx="15.8" cy="17.4" r="1.6" fill={fg} />
        <circle cx="33.8" cy="17.4" r="1.6" fill={fg} />
        <path d="M14 32 Q24 40 34 32" stroke={bg} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'alien',
    label: 'Alien',
    tone: 'light',
    art: (bg, fg) => (
      <>
        <path d="M24 6C36 6 41 18 37 28C34 36 29 41 24 41C19 41 14 36 11 28C7 18 12 6 24 6Z" fill={fg} />
        <ellipse cx="17" cy="23" rx="5" ry="3" transform="rotate(20 17 23)" fill={bg} />
        <ellipse cx="31" cy="23" rx="5" ry="3" transform="rotate(-20 31 23)" fill={bg} />
        <path d="M21 34h6" stroke={bg} strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'ghost',
    label: 'Ghost',
    tone: 'dark',
    art: (bg, fg) => (
      <>
        <path d="M11 40V22A13 13 0 0 1 37 22V40L32.67 36.5L28.33 40L24 36.5L19.67 40L15.33 36.5Z" fill={fg} />
        <ellipse cx="19" cy="23" rx="2.2" ry="3" fill={bg} />
        <ellipse cx="29" cy="23" rx="2.2" ry="3" fill={bg} />
        <ellipse cx="24" cy="30" rx="2" ry="2.5" fill={bg} />
      </>
    ),
  },
  {
    id: 'moon',
    label: 'Moon',
    tone: 'light',
    art: (_bg, fg) => (
      <>
        <path d="M28 8A17 17 0 1 0 41 31A14 14 0 0 1 28 8Z" fill={fg} />
        <circle cx="36" cy="14" r="1.7" fill={fg} />
        <circle cx="41" cy="22" r="1.1" fill={fg} />
      </>
    ),
  },
  {
    id: 'cactus',
    label: 'Cactus',
    tone: 'dark',
    art: (bg, fg) => (
      <>
        <rect x="19" y="8" width="10" height="34" rx="5" fill={fg} />
        <path d="M19 27H15a3 3 0 0 1-3-3V18" stroke={fg} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M29 31h4a3 3 0 0 0 3-3v-6" stroke={fg} strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="22" cy="21" r="1.3" fill={bg} />
        <circle cx="26" cy="21" r="1.3" fill={bg} />
        <path d="M22.5 25Q24 26.6 25.5 25" stroke={bg} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'sun',
    label: 'Sun',
    tone: 'light',
    art: (bg, fg) => (
      <>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4
          return (
            <line
              key={i}
              x1={24 + 13 * Math.cos(a)}
              y1={24 + 13 * Math.sin(a)}
              x2={24 + 18 * Math.cos(a)}
              y2={24 + 18 * Math.sin(a)}
              stroke={fg}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          )
        })}
        <circle cx="24" cy="24" r="9" fill={fg} />
        <circle cx="21" cy="22.5" r="1.4" fill={bg} />
        <circle cx="27" cy="22.5" r="1.4" fill={bg} />
        <path d="M20.5 26.5Q24 30 27.5 26.5" stroke={bg} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </>
    ),
  },
]

export const AVATAR_IDS = AVATARS.map((a) => a.id)

export function avatarLabel(id: string): string {
  return (AVATARS.find((a) => a.id === id) ?? AVATARS[0]).label
}
