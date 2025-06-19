<template>
  <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
    <div class="md:col-span-2">
      <slot />
    </div>
    <div class="md:col-span-1">
      <slot name="right" />
    </div>
  </div>
</template>
