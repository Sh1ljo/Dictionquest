export type ShopItemId = 'lucky-charm' | 'quick-fingers' | 'ad-free'

export const SHOP_ITEMS: {
  id: ShopItemId
  name: string
  description: string
  effect: string
}[] = [
  {
    id: 'lucky-charm',
    name: 'Lucky Charm',
    description: 'A little extra luck on every roll.',
    effect: 'Raises each tier’s word-hit chance by 20% (relative).',
  },
  {
    id: 'quick-fingers',
    name: 'Quick Fingers',
    description: 'Get back to rolling a little sooner.',
    effect: 'Shortens reveal animations by 20%.',
  },
  {
    id: 'ad-free',
    name: 'Ad-Free Pass',
    description: 'Keep your game uninterrupted.',
    effect: 'Disables future ad placements. There are no ads in the game yet.',
  },
]

export const SHOP_PRICE = 2
