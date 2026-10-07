export function recoveryRedirect(origin: string, base: string) {
  return new URL(`${base}?recuperacio=1`, origin).href
}
export function recoveryLink(url: string) {
  const parsed = new URL(url)
  const fragment = new URLSearchParams(parsed.hash.slice(1))
  const recovery = parsed.searchParams.has('recuperacio') || fragment.get('type') === 'recovery'
  if (!recovery) return null
  return {
    accessToken: fragment.get('access_token'), refreshToken: fragment.get('refresh_token'),
    code: parsed.searchParams.get('code'), tokenHash: parsed.searchParams.get('token_hash'),
    error: fragment.get('error') || parsed.searchParams.get('error'),
  }
}

let initialRecovery: ReturnType<typeof recoveryLink> = null
// Normalize the address before HashRouter reads it. Tokens stay in memory,
// never in the application route or browser history after initialization.
export function prepareRecoveryLocation() {
  initialRecovery = recoveryLink(window.location.href)
  if (initialRecovery) window.history.replaceState(null, '', `${window.location.pathname}#/recuperacio`)
}
export function getInitialRecovery() { return initialRecovery }
export function clearInitialRecovery() { initialRecovery = null }
