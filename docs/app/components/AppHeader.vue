<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
// import type { NavigationMenuItem } from '@nuxt/ui'

// const props = defineProps<{
//   links: NavigationMenuItem[]
// }>()

const config = useRuntimeConfig().public

const nav = inject<Ref<ContentNavigationItem[]>>('navigation')

// const items = computed(() => props.links.map(({ icon, ...link }) => link))
const navigation = computed(() => nav?.value.find(item => item.path === '/docs')?.children || [])

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

        <UBadge
          :label="`v${config.version}`"
          variant="subtle"
          size="sm"
          class="hidden -mb-[2px] font-semibold sm:inline-block truncate"
        />
      </NuxtLink>
    </template>

    <!-- <UNavigationMenu
      :items="items"
      variant="link"
    /> -->

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

      <UContentNavigation :navigation="navigation" />
    </template>
  </UHeader>
</template>
