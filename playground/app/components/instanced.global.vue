<template>
  <div style="border: 1px solid #dc2626; background: #fef2f2; color: #7f1d1d; padding: 8px; margin-bottom: 1rem">
    <strong>Global component</strong> (<code>instanced.global.vue</code>): ❌ not a good practice
    <p>
      The <code>.global</code> suffix registers it on the Vue app, so it isn't listed in the
      generated components: ContentDocument resolves it from the app's registered components,
      so it can be used from any document.
    </p>
    <p>
      Nuxt registers global components as async (lazily imported) components, so whether this one
      ends up in its own chunk or in the main bundle is up to Nuxt's bundler.
    </p>
    <p>
      Try not to use it. Put content components in <code>components/content/</code> instead.
    </p>
  </div>
</template>
