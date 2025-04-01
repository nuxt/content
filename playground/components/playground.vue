<template>
  <div>
    <ContentRenderer
      :value="value"
    />
    <UButton @click="randomize">
      Change Component
    </UButton>
  </div>
</template>

<script setup lang="ts">
const body = ref({
  type: 'root',
  children: [
    {
      type: 'element', tag: 'p', props: {},
      children: [
        { type: 'text', value: 'Hello ' },
        { type: 'element', tag: 'span', props: {}, children: [
          { type: 'text', value: 'world' },
        ] },
        { type: 'text', value: '!' },
      ],
    },
  ],
})
const value = computed(() => {
  return { body: body.value }
})

const tags = ['TestA', 'TestB', 'TestC']
const randomize = () => {
  let tag = body.value.children[0].children[1].tag
  while (tag === body.value.children[0].children[1].tag) {
    tag = tags[Math.floor(Math.random() * tags.length)]
  }
  body.value.children[0].children[1].tag = tag
  body.value.children[0].children[1].children![0]!.value = `world (${tag})`
}
</script>
