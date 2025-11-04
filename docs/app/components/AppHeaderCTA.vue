<template>
  <UButton
    v-if="$route.path == '/'"
    label="Open Legacy Studio"
    color="neutral"
    variant="subtle"
    to="https://nuxt.studio"
    size="sm"
    class="hidden sm:inline-flex"
    target="_blank"
  />
</template>
