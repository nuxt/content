<template>
  <div class="wrapper">
    <h4>Looking for v1 documentation ?</h4>
    <div class="links-wrapper">
      <button-link href="/v1/getting-started/introduction" color="black" size="large">
        English
      </button-link>
      <button-link href="/fr/v1/getting-started/introduction" color="black" class="ml-2" size="large">
        French
      </button-link>
      <button-link href="/ja/v1/getting-started/introduction" color="black" class="ml-2" size="large">
        Japanese
      </button-link>
    </div>
    <ellipsis />
  </div>
</template>

<style scoped lang="ts">
css({
  '.wrapper': {
    // relative py-8 mb-8 flex flex-col items-center justify-center
    position: 'relative',
    padding: '2rem',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  h4: {
    // text-2xl font-semibold mb-4
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem'
  },
  '.links-wrapper': {
    // flex gap-8 justify-center
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center'
  }
})
</style>
