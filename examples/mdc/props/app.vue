<template>
  <NuxtExampleLayout example="mdc/props" repo="nuxt/content">
    <template #icon>
      Nuxt/content
    </template>
    <Content :key="$route.path" />
  </NuxtExampleLayout>
</template>
