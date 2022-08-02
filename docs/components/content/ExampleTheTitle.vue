<template>
  <h1 class="text-4xl">
    <Markdown :use="$slots.default" unwrap="p" />
  </h1>
</template>
