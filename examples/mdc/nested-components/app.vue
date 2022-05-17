<template>
  <NuxtExampleLayout example="mdc/nested-components" repo="nuxt/content">
    <template #icon>
      Nuxt/content
    </template>
    <Content :key="$route.path" />
  </NuxtExampleLayout>
</template>

<style>
  section, aside {
    margin-left: 2rem;
  }
</style>
