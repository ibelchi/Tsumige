export function genreKey(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('ca')
}
export function genreOptions(values: readonly (string | null | undefined)[], current = '') {
  const options = new Map<string, string>()
  for (const value of values.filter((v): v is string => typeof v === 'string' && Boolean(v.trim())).sort((a,b)=>a.localeCompare(b,'ca') || (a<b?-1:a>b?1:0))) {
    const key=genreKey(value)
    if (!options.has(key)) options.set(key,value)
  }
  // Preserve the exact saved spelling, including legacy variants, until the user changes it.
  if(current !== '') options.set(genreKey(current),current)
  return [...options.values()].sort((a,b)=>a.localeCompare(b,'ca'))
}
export function confirmGenre(value: string, options: readonly string[]) {
  const clean=value.trim().replace(/\s+/g,' ')
  if(!clean) return null
  return options.find(option=>genreKey(option)===genreKey(clean)) ?? clean
}
