<script setup>
const { setLocale, locales, locale } = useI18n()
</script>

<template>
  <UApp>
    <UContainer>
      <div class="py-4">
        <UButtonGroup>
          <UButton
            v-for="_locale of locales"
            :key="_locale.code"
            :label="`${_locale.name} (${_locale.code})`"
            color="neutral"
            :variant="_locale.code === locale ? 'solid' : 'outline'"
            class="px-4"
            @click="setLocale(_locale.code)"
          />
        </UButtonGroup>
      </div>
      <NuxtLoadingIndicator color="#FFF" />
      <NuxtPage />
    </UContainer>
  </UApp>
</template>

<style>
@import "tailwindcss" theme(static);
@import "@nuxt/ui";

@source "../content/**/*";

@theme {
  --font-sans: 'Public Sans', sans-serif;

  --color-green-50: #EFFDF5;
  --color-green-100: #D9FBE8;
  --color-green-200: #B3F5D1;
  --color-green-300: #75EDAE;
  --color-green-400: #00DC82;
  --color-green-500: #00C16A;
  --color-green-600: #00A155;
  --color-green-700: #007F45;
  --color-green-800: #016538;
  --color-green-900: #0A5331;
  --color-green-950: #052E16;
}

:root {
  --ui-container: 90rem;
}

.dark {
  --ui-bg: var(--ui-color-neutral-950);
  --ui-bg-muted: var(--ui-color-neutral-900);
  --ui-bg-elevated: var(--ui-color-neutral-900);
  --ui-bg-accented: var(--ui-color-neutral-800);
}
</style>
