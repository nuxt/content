<template>
  <div class="grid grid-cols-2 h-screen">
    <textarea
      v-model="md"
      class="w-full p-4"
    />
    <MDC
      v-slot="{ data, body }"
      tag="article"
      :value="md"
      class="p-4"
    >
      <h1>{{ data?.name }}</h1>
      <MDCRenderer
        :body="body"
        :data="data"
        :prose="false"
      />
    </MDC>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const md = ref(`---
name: Sam
---

# Simple

Simple paragraph

\`\`\`typescript
const a = 6;
\`\`\`
`)
</script>
