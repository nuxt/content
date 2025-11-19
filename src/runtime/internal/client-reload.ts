/**
 * Helper that performs a best-effort cache purge + location reload whenever we detect
 * that the client is running with an out-of-date content manifest.
 */
const RELOAD_GUARD = '__nuxt_content_pending_reload__'

let pendingReload: Promise<never> | null = null

const isClient = () => typeof window !== 'undefined' && typeof document !== 'undefined'

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
