<template>
  <UPageSection
    :ui="{ container: 'py-6 sm:py-10 lg:py-14' }"
    :links="[
      {
        label: 'Get started for free',
        to: 'https://nuxt.studio',
        target: '_blank',
        trailingIcon: 'i-ph-arrow-right',
      },
      {
        label: 'Read docs',
        to: '/docs/studio/setup',
        variant: 'ghost',
        color: 'neutral',
      },
    ]"
  >
    <UColorModeImage
      class="absolute top-0 w-full z-[-1]"
      light="/gradient-light.svg"
      dark="/gradient-dark.svg"
      alt="gradient cta"
    />

    <template #title>
      <span>Start with Studio <span class="text-primary">today</span></span>
    </template>
  </UPageSection>
</template>
