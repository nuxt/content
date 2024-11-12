<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const nav = inject<Ref<ContentNavigationItem[]>>('navigation')

const navigation = computed(() => nav?.value.find(item => item.path === '/docs')?.children || [])
</script>

<template>
  <UMain>
    <UContainer>
      <UPage>
        <template #left>
          <UPageAside>
            <UContentNavigation
              :navigation="navigation"
              highlight
            />
          </UPageAside>
        </template>

        <slot />
      </UPage>
    </UContainer>
  </UMain>
</template>
