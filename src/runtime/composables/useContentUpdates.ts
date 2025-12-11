import { computed, useState } from '#imports'
import { manifestVersion } from '#content/manifest'
import { forceClientRefresh } from '../internal/client-reload'

const VERSION_ENDPOINT = '/__nuxt_content/manifest.json'

type ContentUpdateState = {
  currentVersion: string
  latestVersion: string | null
  hasUpdate: boolean
  checking: boolean
  error: string | null
  lastChecked: number | null
}

export function useContentUpdates() {
  const state = useState<ContentUpdateState>('nuxt-content-updates', () => ({
    currentVersion: manifestVersion || '',
    latestVersion: manifestVersion || null,
    hasUpdate: false,
    checking: false,
    error: null,
    lastChecked: null,
  }))

  const hasUpdate = computed(() => state.value.hasUpdate)
  const isChecking = computed(() => state.value.checking)
  const latestVersion = computed(() => state.value.latestVersion)
  const lastChecked = computed(() => state.value.lastChecked)
  const error = computed(() => state.value.error)
  const currentVersion = computed(() => state.value.currentVersion)

  async function checkForContentUpdate() {
    state.value.lastChecked = Date.now()

    if (!import.meta.client) {
      state.value.hasUpdate = false
      state.value.latestVersion = state.value.currentVersion
      return false
    }

    state.value.checking = true
    state.value.error = null

    try {
      const query = import.meta.dev ? { t: Date.now() } : undefined
      const { version } = await $fetch<{ version?: string }>(VERSION_ENDPOINT, { query })

      state.value.latestVersion = version || null
      state.value.hasUpdate = Boolean(version && version !== state.value.currentVersion)

      return state.value.hasUpdate
    }
    catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to check content updates'
      throw err
    }
    finally {
      state.value.checking = false
    }
  }

  async function refreshContent(reason = 'manual-refresh') {
    if (!import.meta.client) {
      return
    }
    await forceClientRefresh(reason)
  }

  return {
    currentVersion,
    latestVersion,
    hasUpdate,
    isChecking,
    lastChecked,
    error,
    checkForContentUpdate,
    refreshContent,
  }
}
