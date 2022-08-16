<template>
  <div class="alert">
    <ContentSlot :use="$slots.default" unwrap="p" />
  </div>
</template>

<style scoped>
.alert {
  padding: 5px 10px;
  border: 1px #ddd solid;
  border-radius: 5px;
}
</style>
