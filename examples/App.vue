<template>
  <div>
    <div>
      <span v-for="item in list" :key="item" @click="load(item)">
        {{ item }}
      </span>
    </div>
    <pre>{{ content }}</pre>
  </div>
</template>

<script setup>
import { getContent, useContentList } from '#docus'

const content = ref('')
const load = async id => {
  content.value = await getContent(id)
}

const list = await useContentList()
</script>

<style>
span {
  display: inline-block;
  padding: 5px;
  margin: 5px;
  border: 1px solid #ccc;
  cursor: pointer;
}
</style>
