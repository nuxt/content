<template>
  <nuxt-link id="lang-switcher" :to="switchLocalePath(theOtherLocaleCode)">{{ theOtherLocaleCode }}</nuxt-link>
</template>

<script>
export default {
  computed: {
    theOtherLocaleCode () {
      const locale = this.$i18n.locales.filter(i => i.code !== this.$i18n.locale)
      return locale.code
    }
  }
}
</script>
