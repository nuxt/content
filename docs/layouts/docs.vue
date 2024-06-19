<script setup lang="ts">
import type { NavItem } from '@nuxt/content';

const navigation = inject<NavItem[]>('navigation')
</script>

<template>
  <div>
    <UMain>
      <UContainer>
        <UAlert v-if="$route.path.startsWith('/v1/')" title="" color="cyan" variant="soft" class="mb-1 mt-4">
          <template #title>
            <span class="font-medium pr-2">You are reading Nuxt Content V1 documentation.</span><UButton color="cyan" variant="ghost" trailing-icon="i-ph-arrow-right-light" to="/get-started/installation">
              Read the latest version
            </UButton>
          </template>
        </UAlert>
        <UPage>
          <template #left>
            <UAside>
              <template #top>
                <UContentSearchButton size="md" />
              </template>
              <UNavigationTree :links="mapContentNavigation(navigation!)" />
            </UAside>
          </template>
          <slot />
        </UPage>
      </UContainer>
    </UMain>
  </div>
</template>
