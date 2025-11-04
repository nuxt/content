<template>
  <UButton
    v-if="$route.path == '/'"
    label="Open Legacy Studio"
    to="https://nuxt.studio"
    size="sm"
    class="hidden sm:inline-flex"
    target="_blank"
  />
</template>
