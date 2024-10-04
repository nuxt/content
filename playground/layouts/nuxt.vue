<script setup lang="ts">
const { data } = await useAsyncData('nuxt-contents-list', () => queryCollectionNavigation('nuxt'))
const links = computed(() => {
  const root = data.value?.[0].children || []
  return root?.flatMap(item => ([
    {
      label: item.title,
      to: item.page !== false ? item.path : undefined,
    },
    ...(item.children?.map(child => ({
      label: ` -- ${child.title}`,
      to: child.path,
    })) ?? []),
  ]))
})
</script>

<template>
  <div class="flex">
    <UVerticalNavigation
      class="w-[200px] flex-none p-2 sticky top-0 h-screen overflow-scroll"
      :links="links"
    />
    <div class="flex-1 p-4 prose prose-invert">
      <slot />
    </div>
  </div>
</template>
