<template>
  <ContentSlot :use="$slots.default" unwrap="ul li">
    <template #between>
      <br>
    </template>
  </ContentSlot>
</template>
