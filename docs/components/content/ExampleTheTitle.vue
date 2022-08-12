<template>
  <h1 class="text-4xl">
    <ContentRichSlot :use="$slots.default" unwrap="p" />
  </h1>
</template>
