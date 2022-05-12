<template>
  <NuxtExampleLayout example="mdc/slot" repo="nuxt/content">
    <template #icon>
      Nuxt/content
    </template>
    <Content :key="$route.path" />
  </NuxtExampleLayout>
</template>
