<template>
  <nuxt />
</template>

<script>
export default {
  head () {
    return {
      title: '',
      titleTemplate: (chunk) => {
        if (chunk) {
          return `${chunk} - NuxtJS`
        }

        return 'NuxtJS'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
