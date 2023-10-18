<script setup>
const { layout } = useContent()
</script>
<template>
  <div>
    <PageNav />
    <pre>Layout: {{ layout }}</pre>
    <slot />
  </div>
</template>

<style>
body,
html {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  min-width: 100vw;
}
</style>
