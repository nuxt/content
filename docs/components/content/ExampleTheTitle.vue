<template>
  <h1 class="text-4xl">
    <ContentSlot :use="$slots.default" unwrap="p" />
  </h1>
</template>
