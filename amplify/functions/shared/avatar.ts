const AVATAR_PALETTE = [
  '#E57373',
  '#F06292',
  '#BA68C8',
  '#9575CD',
  '#7986CB',
  '#64B5F6',
  '#4DB6AC',
  '#81C784',
  '#FFD54F',
  '#FF8A65',
]

export function hashAvatarColor(sub: string): string {
  let hash = 0
  for (let i = 0; i < sub.length; i++) {
    hash = (hash << 5) - hash + sub.charCodeAt(i)
    hash |= 0
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}
