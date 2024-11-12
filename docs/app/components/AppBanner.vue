<template>
  <UBanner
    icon="i-lucide-construction"
    :actions="[{ label: 'Go to Nuxt Content v2', to: 'https://content.nuxt.com', trailingIcon: 'i-lucide-arrow-right' }]"
    :close="false"
  >
    <template #title>
      You're looking at the documentation for <span class="font-semibold">Nuxt Content v3</span>!
    </template>
  </UBanner>
</template>
