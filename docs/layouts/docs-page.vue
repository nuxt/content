<template>
  <div class="docs-page">
    <Container>
      <slot />
    </Container>
  </div>
</template>

<style scoped lang="ts">
css({
  '.docs-page': {
    padding: '40px 0'
  }
})
</style>
