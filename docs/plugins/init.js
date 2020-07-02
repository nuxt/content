export default async function ({ store, app }) {
  if (process.server) {
    await store.dispatch('fetchCategories')
    await store.dispatch('fetchReleases')
  }
  // Spa Fallback
  if (process.client && !store.state.categories[app.i18n.locale]) {
    await store.dispatch('fetchCategories')
  }
  if (process.client && !store.state.releases) {
    await store.dispatch('fetchReleases')
  }
  // Hot reload on development
  if (process.client && process.dev) {
    window.onNuxtReady(() => {
      window.$nuxt.$on('content:update', () => store.dispatch('fetchCategories'))
    })
  }
}
