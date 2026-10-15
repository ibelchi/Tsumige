import { platformName } from '@/lib/platform'

export function ExternalGameLinks({ title, platform }: { title: string; platform: string }) {
  const name = platformName(platform).trim()
  // A store or emulator does not identify a trailer's hardware edition.
  const usefulPlatform = name && !['Steam', 'Epic Games', 'itch.io', 'Emulador'].includes(name) ? name : ''
  const query = [title.trim(), usefulPlatform, 'trailer'].filter(Boolean).join(' ')
  const links = [
    { label: 'Cerca el tràiler a YouTube', href: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, icon: 'youtube.png' },
    { label: 'Cerca el joc a MobyGames', href: `https://www.mobygames.com/search/?q=${encodeURIComponent(title)}`, icon: 'mobygames-whale.png' },
  ]
  return <div role="group" aria-label="Cerques externes del joc" className="flex items-center justify-center gap-2">
    {links.map(link => <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} title={link.label} className="inline-flex size-11 shrink-0 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-ring">
      <img src={`${import.meta.env.BASE_URL}icons/${link.icon}`} width="36" height="36" alt="" aria-hidden="true" className="size-9 object-contain" />
    </a>)}
  </div>
}
