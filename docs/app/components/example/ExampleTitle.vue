<template>
  <h1 class="text-4xl">
    <MDCSlot
      :use="$slots.default"
      unwrap="p"
    />
  </h1>
</template>
