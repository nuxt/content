<template>
  <div class="playground">
    <textarea v-model="content" />
    <div class="content">
      <div class="tabs">
        <button v-for="name in tabs" :key="name" class="outline" :class="{ active: name === tab }" @click="tab = name">
          {{ name }}
        </button>
      </div>

      <MDC v-slot="{ data, body }" :value="content">
        <MDCRenderer v-if="tab === 'Preview'" :body="body" :data="data" />
        <pre v-if="tab === 'AST'" style="padding: 1rem;">{{ body }}</pre>
      </MDC>
    </div>
  </div>
</template>

<script setup lang="ts">
const tab = ref('Preview')
const tabs = ref(['Preview', 'AST'])
const content = ref(`
---
title: MDC
cover: https://nuxtjs.org/design-kit/colored-logo.svg
---
:img{:src="cover"}

# {{ $doc.title }}

MDC stands for _**M**ark**D**own **C**omponents_.

This syntax supercharges regular Markdown to write documents interacting deeply with any Vue component from your \`components/content/\` directory or provided by a module.

## Next steps
- [Install Nuxt Content](/get-started)
- [Explore the MDC syntax](/guide/writing/mdc)


You are visiting document: **{{ $doc._id }}**.
Current route is: **{{ $route.path }}**


::callout
---
type: success
---
This is an alert for _**{{ type }}**_
::

::callout{type="danger"}
This is an alert for _**{{ type }}**_
::
`.trim())
</script>

<style scoped>
.playground {
  display: flex;
  align-items: stretch;
  flex: 1;
  height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
}

.playground textarea {
  flex: 1;
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.playground .content {
  flex: 1;
  width: 50%;
  overflow-y: auto;
  padding: 1rem;
}

.playground .tabs {
  display: flex;
  flex-direction: row;
  padding: 1rem;
  gap: 1rem;
}

.playground .tabs>button {
  opacity: 0.75;
}

.playground .tabs>button.active {
  border-width: 2px;
  opacity: 1;
}
</style>
