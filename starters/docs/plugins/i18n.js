export default function ({ app, store }) {
  app.i18n.onLanguageSwitched = async (oldLocale, newLocale) => {
    await store.dispatch('fetchCategories')
  }
}
