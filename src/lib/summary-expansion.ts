// Estat de la visita: sobreviu al desmuntatge en obrir un detall, separat per compte i quadre.
const expanded = new Set<string>()
const listeners = new Set<() => void>()
export const summaryExpansion = {
  get: (key: string) => expanded.has(key),
  subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener) },
  set(key: string, value: boolean) {
    if (expanded.has(key) === value) return
    if (value) expanded.add(key); else expanded.delete(key)
    listeners.forEach(listener => listener())
  },
}
