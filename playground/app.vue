<script setup lang="ts">
const items = ref([
  {
    label: 'Default',
    icon: 'i-lucide-book-open',
    to: '/',
    children: [
      {
        label: 'Playground',
        to: '/playground',
      },
      {
        label: 'Query Playground',
        to: '/query-playground',
      },
    ],
  },
  {
    label: 'Vue',
    icon: 'i-logos-vue',
    to: '/vue',
  },
  {
    label: 'Nuxt',
    icon: 'i-logos-nuxt-icon',
    to: '/nuxt/getting-started/introduction',
  },
  {
    label: 'Hacker News',
    icon: 'i-ion-logo-hackernews',
    to: '/hackernews',
  },
  {
    label: 'Content V2',
    icon: 'i-lucide-folder-open',
    to: '/content-v2',
  },
  {
    label: 'Data',
    icon: 'i-lucide-folder-open',
    to: '/data/foo',
  },
])
</script>

<template>
  <UApp>
    <UHeader title="Nuxt Content: Playground">
      <UNavigationMenu
        :items="items"
        class="w-full justify-center"
      />

      <template #body>
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          class="-mx-2.5"
        />
      </template>

      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <UContainer>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </UContainer>
    </UMain>
  </UApp>
</template>

<style>
@import "tailwindcss" theme(static);
@import "@nuxt/ui";

@source "./content/**/*";
</style>
