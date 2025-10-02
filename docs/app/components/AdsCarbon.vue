<script setup lang="ts">
const el = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (!el.value) {
    return
  }
  if (document.querySelector('#_carbonads_js')) {
    return
  }

  const script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute('src', 'https://cdn.carbonads.com/carbon.js?serve=CWYIPK7W&placement=contentnuxtcom')
  script.setAttribute('id', '_carbonads_js')

  el.value?.appendChild(script)
})
</script>

<template>
  <div
    ref="el"
    class="carbon"
  />
</template>

<style scoped>
@reference "../assets/css/main.css";

.carbon :deep(#carbonads) {
  @apply relative bg-muted rounded-md hover:bg-elevated w-full transition-colors min-h-[220px] p-2.5;

  .carbon-img {
    @apply flex justify-center w-full;

    & > img {
      @apply !max-w-full w-full rounded-sm;
    }
  }

  .carbon-text {
    @apply text-[13px] transition-colors font-medium text-pretty flex pt-2;
  }

  .carbon-poweredby {
    @apply block text-xs text-muted pt-2;
  }

  &:hover {
    .carbon-text {
      @apply text-highlighted;
    }
  }
}
</style>
