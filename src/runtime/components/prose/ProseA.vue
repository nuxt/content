<template>
  <a v-if="remote || static" target="blank" :href="href"><slot /></a>
  <NuxtLink v-else :to="href" :target="blank" :static="static">
    <!-- TODO: implement static & remote logic -->
    <slot />
  </NuxtLink>
</template>

<script lang="ts">
import { hasProtocol } from 'ufo'
export default {
  props: {
    href: {
      type: String,
      default: ''
    },
    blank: {
      type: Boolean,
      default: false
    },
    /**
     * `true` if `href` points to a static file
     */
    static: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    remote() {
      return hasProtocol(this.href, true)
    }
  }
}
</script>
