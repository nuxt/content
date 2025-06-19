<template>
  <UButton
    v-if="$route.path == '/'"
    label="Open Studio"
    to="https://nuxt.studio"
    size="sm"
    class="hidden sm:inline-flex"
  />
</template>
