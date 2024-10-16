<template>
  <UBanner
    icon="i-heroicons-wrench-screwdriver"
    :actions="[{ label: 'Go to Nuxt Content v2', to: 'https://content.nuxt.com', trailingIcon: 'i-heroicons-arrow-right-20-solid' }]"
    :close="false"
  >
    <template #title>
      You're looking at the documentation for <span class="font-semibold">Nuxt Content v3</span>!
    </template>
  </UBanner>
</template>
