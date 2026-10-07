export function storeName(value: string) {
  return ['epic', 'epic games', 'epic games store'].includes(value.trim().toLowerCase()) ? 'Epic Games' : value
}
