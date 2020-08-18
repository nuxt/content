export default async function ({ store, app }) {
  if (process.server) {
    await store.dispatch('fetchSettings')
    await store.dispatch('fetchReleases')
    await store.dispatch('fetchCategories')
    await store.dispatch('fetchDefaultBranch')
  }
  // Spa Fallback
  if (process.client && !store.state.settings.filled) {
    await store.dispatch('fetchSettings')
  }
  if (process.client && !store.state.releases.length) {
    await store.dispatch('fetchReleases')
  }
  if (process.client && !store.state.categories[app.i18n.locale]) {
    await store.dispatch('fetchCategories')
  }
  if (process.client && !store.state.settings.defaultBranch) {
    await store.dispatch('fetchDefaultBranch')
  }
  // Hot reload on development
  if (process.client && process.dev) {
    window.onNuxtReady(() => {
      window.$nuxt.$on('content:update', async () => {
        await store.dispatch('fetchSettings')
        await store.dispatch('fetchReleases')
        await store.dispatch('fetchDefaultBranch')
        await store.dispatch('fetchCategories')
      })
    })
  }
}
