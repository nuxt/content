<template>
  <NuxtExampleLayout example="essentials/hello-world" repo="nuxt/content">
    <template #icon>
      Nuxt/content
    </template>
    <Content :key="$route.path" />
  </NuxtExampleLayout>
</template>
