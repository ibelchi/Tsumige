import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { readTheme, saveTheme, themeKey, type ThemePreference } from '@/lib/theme'

export function ThemeSelector() {
  const [preference, setPreference] = useState(readTheme)
  useEffect(() => {
    const storageChanged = (event: StorageEvent) => { if (event.key === themeKey || event.key === null) setPreference(readTheme()) }
    const localChanged = (event: Event) => setPreference((event as CustomEvent<ThemePreference>).detail)
    window.addEventListener('storage', storageChanged)
    window.addEventListener('tsumige-theme', localChanged)
    return () => {
      window.removeEventListener('storage', storageChanged)
      window.removeEventListener('tsumige-theme', localChanged)
    }
  }, [])
  return <div role="group" aria-label="Tema de l’aplicació" className="flex justify-center gap-1 border-t px-3 pt-3 pb-4">
    {([['light', 'Clar', Sun], ['dark', 'Fosc', Moon]] as const).map(([value, label, Icon]) => <Button key={value} type="button" variant="ghost" size="sm" aria-label={label} title={label} aria-pressed={preference === value} className={`size-11 ${preference === value ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'text-muted-foreground'}`} onClick={() => {
      setPreference(value); saveTheme(value)
      window.dispatchEvent(new CustomEvent<ThemePreference>('tsumige-theme', { detail: value }))
    }}><Icon aria-hidden="true" /></Button>)}
  </div>
}
