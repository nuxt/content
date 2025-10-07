<template>
  <div class="props-example">
    <h3>Props Example Component</h3>
    <div class="props-display">
      <p><strong>Count (number):</strong> {{ count }}</p>
      <p><strong>Title (string):</strong> {{ title }}</p>
      <p><strong>Is Active (boolean):</strong> {{ isActive ? 'Yes' : 'No' }}</p>
    </div>

    <div
      v-if="isActive"
      class="conditional-content"
    >
      <p>This content is shown when isActive is true!</p>
      <p>Current count multiplied by 2: {{ count * 2 }}</p>
    </div>

    <div
      class="styled-title"
      :class="{ active: isActive }"
    >
      {{ title }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  count: number
  title: string
  isActive: boolean
}

efineProps<Props>()

// You can also define props with default values like this:
// const props = withDefaults(defineProps<Props>(), {
//   count: 0,
//   title: 'Default Title',
//   isActive: false
// })
</script>

<style scoped>
.props-example {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: 10px 0;
}

.props-display {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin: 10px 0;
}

.conditional-content {
  background-color: #e6f3ff;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.styled-title {
  font-size: 1.5em;
  font-weight: bold;
  color: #666;
  transition: color 0.3s ease;
}

.styled-title.active {
  color: #007bff;
}
</style>
