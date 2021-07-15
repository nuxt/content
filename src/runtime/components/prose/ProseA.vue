<template>
  <NuxtLink :to="href" :blank="blank" :static="static">
    <!-- TODO: implement static & remote logic -->
    <slot />
  </NuxtLink>
</template>

<script lang="ts">
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
  }
}
</script>
