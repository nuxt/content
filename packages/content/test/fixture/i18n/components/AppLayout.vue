<template>
  <div>
    <header><slot name="header" /></header>
    <main><slot>Default content</slot></main>
    <footer><slot name="footer" /></footer>
  </div>
</template>

<script>
export default { name: 'AppLayout' }
</script>
