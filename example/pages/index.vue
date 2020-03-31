<template>
  <div>
    <h1>Works!</h1>
    <pre>{{ page }}</pre>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content }) {
    const page = await $content('hello')

    return { page }
  }
}
</script>
