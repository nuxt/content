<script setup lang="ts">
const { data } = await useAsyncData('contents-list', () => getCollectionNavigation('nuxt_content'))
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
    sss
    <UVerticalNavigation
      class="w-[200px] flex-none p-2 sticky top-0 h-screen"
      :links="links"
    />
    <div class="flex-1 p-4 prose prose-invert">
      <slot />
    </div>
  </div>
</template>
