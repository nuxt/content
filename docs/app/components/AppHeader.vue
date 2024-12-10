<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const config = useRuntimeConfig().public

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const items = ref([
  {
    label: 'Docs',
    to: '/docs/getting-started/installation',
  },
  {
    label: 'Studio',
    to: '/studio',
    children: [
      {
        label: 'Features',
        icon: 'i-lucide-file-pen-line',
        to: '/studio',
      },
      {
        label: 'Pricing',
        icon: 'i-lucide-rocket',
        to: '/studio/pricing',
      },
      {
        label: 'Templates',
        icon: 'i-lucide-panels-top-left',
        to: '/studio/templates',
      },
    ],
  },
  {
    label: 'Blog',
    to: '/blog',
  },
  {
    label: 'Changelog',
    to: '/changelog',
  },
])

defineShortcuts({
  meta_g: () => {
    window.open('https://github.com/nuxt/content/tree/v3', '_blank')
  },
})
</script>

<template>
  <UHeader :ui="{ left: 'min-w-0' }">
    <template #left>
      <NuxtLink
        to="/"
        class="flex items-end gap-2 font-bold text-xl text-[--ui-text-highlighted] min-w-0"
        aria-label="Nuxt Content"
      >
        <AppLogo class="w-auto h-6 shrink-0" />

        <UDropdownMenu
          v-slot="{ open }"
          :modal="false"
          :items="[{ label: `v${config.version}`, active: true, color: 'primary', checked: true, type: 'checkbox' }, { label: 'v2.13.4', to: 'https://content.nuxt.com' }]"
          :ui="{ content: 'w-(--radix-dropdown-menu-trigger-width) min-w-0' }"
          size="xs"
        >
          <UButton
            :label="`v${config.version}`"
            variant="subtle"
            trailing-icon="i-lucide-chevron-down"
            size="xs"
            class="-mb-[3px] font-semibold rounded-full truncate hidden sm:flex"
            :class="[open && 'bg-[var(--ui-primary)]/15 ']"
            :ui="{
              trailingIcon: ['transition-transform duration-200', open ? 'rotate-180' : undefined].filter(Boolean).join(' '),
            }"
          />
        </UDropdownMenu>
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      class="justify-center"
    />

    <template #right>
      <UButton
        v-if="$route.path === '/'"
        label="Get started"
        to="/docs/getting-started"
        size="sm"
        class="hidden sm:inline-flex"
      />

      <UColorModeButton class="hidden sm:inline-flex" />

      <UTooltip
        text="Search"
        :kbds="['meta', 'K']"
      >
        <UContentSearchButton />
      </UTooltip>

      <UTooltip
        text="Open on GitHub"
        :kbds="['meta', 'G']"
      >
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/nuxt/content/tree/v3"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>
    </template>

    <template #content>
      <!-- <UNavigationMenu orientation="vertical" :items="items" class="-ml-2.5" />

      <USeparator type="dashed" class="my-4" /> -->

      <UContentNavigation
        highlight
        :navigation="navigation"
      />
    </template>
  </UHeader>
</template>
