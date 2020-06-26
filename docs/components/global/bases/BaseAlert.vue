<template>
  <div class="alert border-l-4 p-4 mb-4" :class="`alert-${type}`">
    <div class="flex">
      <div class="flex-shrink-0 self-start pt-1">
        <IconInfo v-if="type === 'info'" class="alert-icon" />
        <IconAlert v-else class="alert-icon" />
      </div>
      <div class="ml-2 alert-content text-sm">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'warning'
    }
  }
}
</script>

<style>
.alert p {
  @apply m-0 !important;
}
.alert-warning {
  @apply bg-orange-100 border-orange-400;
}
.alert-warning code {
  @apply bg-orange-200 shadow-none;
}
.alert-warning .alert-icon {
  @apply text-orange-400;
}
.alert-warning .alert-content {
  @apply text-orange-700;
}
.dark-mode .alert-warning {
  @apply bg-yellow-900 border-yellow-700;
}
.dark-mode .alert-warning .alert-content {
  @apply text-orange-300 bg-yellow-900 border-yellow-700;
}
.dark-mode .alert-warning .alert-content code {
  @apply bg-yellow-800 !important;
}
.alert-info {
  @apply bg-blue-100 border-blue-400;
}
.alert-info code {
  @apply bg-blue-200 shadow-none;
}
.alert-info .alert-icon {
  @apply text-blue-400;
}
.alert-info .alert-content {
  @apply text-blue-700;
}
.dark-mode .alert-info {
  @apply bg-blue-900 border-blue-700;
}
.dark-mode .alert-info .alert-content {
  @apply text-blue-300 bg-blue-900 border-blue-700;
}
.dark-mode .alert-info .alert-content code {
  @apply bg-blue-800 !important;
}
</style>
