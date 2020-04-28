<template>
  <div class="bg-orange-100 border-l-4 border-orange-400 p-4 mb-4">
    <div class="flex">
      <div class="flex-shrink-0 pt-2">
        <icon-alert />
      </div>
      <div class="ml-3 alert-content text-sm text-orange-700">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.alert-content code {
  @apply bg-orange-200 shadow-none;
}
</style>
