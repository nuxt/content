<script setup lang="ts">
const { data } = await useAsyncData('contents-list', () => queryCollectionNavigation('content'))
const links = computed(() => {
  return data.value?.map(item => ({
    label: item.title,
    to: item.page !== false ? item.path : undefined,
    children: (item.children?.map(child => ({
      label: child.title,
      to: child.path,
    })) ?? []),
  }))
})
</script>

<template>
  <div class="flex">
    <UNavigationMenu
      class="w-[200px] flex-none p-2 sticky top-0 h-screen"
      orientation="vertical"
      :items="links"
    />
    <div class="flex-1 p-4 prose prose-invert">
      <slot />
    </div>
  </div>
</template>
