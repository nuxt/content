<template>
  <div class="wrapper">
    <h4>Looking for v1 documentation ?</h4>
    <div class="links-wrapper">
      <button-link href="/v1/getting-started/introduction" :transparent="true" color="false" size="large">
        English
      </button-link>
      <button-link href="/fr/v1/getting-started/introduction" :transparent="true" color="false" size="large">
        French
      </button-link>
      <button-link href="/ja/v1/getting-started/introduction" :transparent="true" color="false" size="large">
        Japanese
      </button-link>
      <button-link href="/ru/v1/getting-started/introduction" :transparent="true" color="false" size="large">
        Russian
      </button-link>
    </div>
    <ellipsis />
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
    flexWrap: 'wrap',
    gap: '2rem',
    justifyContent: 'center'
  },
  '.links-wrapper a': {
    color: '{color.black}',
    '@dark': {
      color: '{color.white}'
    }
  }
})
</style>
