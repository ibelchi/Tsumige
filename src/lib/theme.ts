export type ThemePreference = 'light' | 'dark'
export const themeKey = 'tsumige-theme'
export function themePreference(value: string | null, darkSystem = false): ThemePreference {
  return value === 'dark' || (value === 'system' && darkSystem) ? 'dark' : 'light'
}
export function readTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(themeKey)
    const preference = themePreference(stored, stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (stored === 'system') localStorage.setItem(themeKey, preference)
    return preference
  } catch { return typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light' }
}
export function applyTheme(preference: ThemePreference) {
  const theme = preference
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151c18' : '#f8f9f6')
}
export function saveTheme(preference: ThemePreference) {
  try { localStorage.setItem(themeKey, preference) } catch { /* Still usable for this page when storage is unavailable. */ }
  applyTheme(preference)
}
export function initializeTheme() {
  let preference = readTheme()
  applyTheme(preference)
  const preferenceChanged = () => { preference = readTheme(); applyTheme(preference) }
  const storageChanged = (event: StorageEvent) => { if (event.key === themeKey || event.key === null) preferenceChanged() }
  const localChanged = (event: Event) => { preference = (event as CustomEvent<ThemePreference>).detail; applyTheme(preference) }
  window.addEventListener('storage', storageChanged)
  window.addEventListener('tsumige-theme', localChanged)
  return () => {
    window.removeEventListener('storage', storageChanged)
    window.removeEventListener('tsumige-theme', localChanged)
  }
}
