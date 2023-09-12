<!-- eslint-disable vue/no-v-html -->
<script setup lang="ts">
const { mapContentNavigation } = useElementsHelpers()
const navigation = inject('navigation')
</script>

<template>
  <div>
    <UMain>
      <UContainer>
        <UPage>
          <template #left>
            <UAside>
              <template #top>
                <UDocsSearchButton size="md" />
              </template>
              <UNavigationTree :links="mapContentNavigation(navigation)" />
            </UAside>
          </template>
          <slot />
        </UPage>
      </UContainer>
    </UMain>
  </div>
</template>
