<template>
  <div
    class="bg-orange-100 dark:bg-yellow-900 border-l-4 border-orange-400 dark:border-yellow-700 p-4 mb-4"
  >
    <div class="flex">
      <div class="flex-shrink-0 pt-2">
        <icon-alert class="h-5 w-5 text-orange-400" />
      </div>
      <div class="ml-3 alert-content text-sm text-orange-700 dark:text-orange-300">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style>
.alert-content code {
  @apply bg-orange-200 shadow-none;
}
.dark-mode .alert-content code {
  @apply bg-yellow-800 !important;
}
</style>
