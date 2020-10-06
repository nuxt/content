<template>
  <component :is="settings.components.dropdown" v-if="settings.components.dropdown && availableLocales.length" class="inline-flex">
    <template #trigger="{ open, toggle }">
      <button
        class="rounded-md hover:text-primary-500 focus:outline-none"
        :class="{ 'text-primary-500': open }"
        @touchstart.stop.prevent="toggle"
      >
        <IconTranslate class="w-6 h-6" />
      </button>
    </template>

    <ul class="py-2">
      <li v-for="locale in availableLocales" :key="locale.code">
        <nuxt-link
          v-if="$i18n.locale !== locale.code"
          :to="switchLocalePath(locale.code)"
          class="flex px-4 items-center hover:text-primary-500 leading-7 whitespace-no-wrap"
        >{{ locale.name }}</nuxt-link>
      </li>
    </ul>
  </component>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'settings'
    ]),
    availableLocales () {
      return this.$i18n.locales.filter(i => i.code !== this.$i18n.locale)
    }
  }
}
</script>
