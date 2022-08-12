<template>
  <ContentRichSlot :use="$slots.default" unwrap="ul li">
    <template #between>
      <br>
    </template>
  </ContentRichSlot>
</template>
