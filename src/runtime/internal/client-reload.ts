/**
 * Helper that performs a best-effort cache purge + location reload whenever we detect
 * that the client is running with an out-of-date content manifest.
 */
const RELOAD_GUARD = '__nuxt_content_pending_reload__'

let pendingReload: Promise<never> | null = null

const isClient = () => typeof window !== 'undefined' && typeof document !== 'undefined'

const RELOAD_LIMIT = 3
const RELOAD_COUNTER_KEY = '__nuxt_content_reload_count__'

export function resetClientReloadCount() {
  if (!import.meta.client || !isClient()) {
    return
  }
  try {
    window.sessionStorage.removeItem(RELOAD_COUNTER_KEY)
  }
  catch {
    // sessionStorage may be unavailable
  }
}

export async function forceClientRefresh(
  reason: string,
  options: { collection?: string } = {},
): Promise<never | void> {
  if (!import.meta.client || !isClient()) {
    return
  }

  if (pendingReload) {
    return pendingReload
  }

  try {
    const count = parseInt(window.sessionStorage.getItem(RELOAD_COUNTER_KEY) || '0', 10)
    if (count >= RELOAD_LIMIT) {
      console.warn(`[content] Infinite reload loop prevented. Logic tried to reload for reason: ${reason}, but limit (${RELOAD_LIMIT}) was reached.`)
      return
    }
    window.sessionStorage.setItem(RELOAD_COUNTER_KEY, String(count + 1))
    window.sessionStorage.setItem(RELOAD_GUARD, `${Date.now()}:${reason}`)
  }
  catch {
    // sessionStorage may be unavailable (Safari private mode etc.)
  }

  pendingReload = (async () => {
    try {
      const { clearClientStorage } = await import('./database.client')
      await clearClientStorage({
        collections: options.collection ? [options.collection] : undefined,
      })
    }
    catch {
      // Clearing cached dumps is best-effort; continue with reload regardless.
    }

    try {
      window.location.reload()
    }
    catch {
      // Fall back to assigning href if reload throws (very old browsers).
      window.location.assign(window.location.href)
    }

    return await new Promise<never>(() => {})
  })()

  return pendingReload
}
