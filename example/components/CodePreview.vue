<template>
  <div class="source-container">
    <div>
      <Markdown />
    </div>
    <div>
      <Markdown use="preview" />
    </div>
  </div>
</template>

<style scoped>
.source-container {
  display: flex;
}
.source-container div {
  flex: 1;
  padding: 1rem;
  border: 1px solid #ccc;
  overflow: auto;
}
</style>
