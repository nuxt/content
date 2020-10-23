<template>
  <div>
    <h1>{{ page.title }}</h1>
    <nuxt-content :document="page" />
    <AppLangSwitcher />
  </div>
</template>

<script>
import AppLangSwitcher from '../components/AppLangSwitcher'

export default {
  components: {
    AppLangSwitcher
  },
  async asyncData ({ $content, app, params }) {
    const page = await $content(app.i18n.locale, params.pathMatch || 'home').fetch()

    return {
      page
    }
  },
  computed: {
    theOtherLocaleCode () {
      const locale = this.$i18n.locales.filter(i => i.code !== this.$i18n.locale)
      return locale.code
    }
  }
}
</script>
