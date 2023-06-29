<template>
  <div class="wrapper">
    <h4>Looking for v1 documentation?</h4>
    <div class="links-wrapper">
      <button-link href="/v1/getting-started/introduction" size="small">
        English
      </button-link>
      <button-link href="/fr/v1/getting-started/introduction" size="small">
        French
      </button-link>
      <button-link href="/ja/v1/getting-started/introduction" size="small">
        Japanese
      </button-link>
    </div>
  </div>
</template>

<style scoped lang="ts">
css({
  '.wrapper': {
    position: 'relative',
    padding: '2rem',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem'
  },
  '.links-wrapper': {
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center'
  },
})
</style>
