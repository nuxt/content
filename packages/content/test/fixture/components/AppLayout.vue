<template>
  <div class="app-layout" style="background-color: blue;">
    <header><slot name="header" /></header>
    <main><slot>Default content</slot></main>
    <footer><slot name="footer" /></footer>
  </div>
</template>

<script>
export default { name: 'AppLayout' }
</script>
