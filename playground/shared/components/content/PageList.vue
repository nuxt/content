<template>
  <div>
    <hr>
    <ul>
      <li v-for="page of pages" :key="page._id">
        <span>🔗</span>
        <NuxtLink :to="page._path">
          {{ page.title }}
        </NuxtLink>
      </li>
    </ul>
    <hr>
  </div>
</template>

<script setup lang="ts">
const { find } = queryContent().where({ $not: { _path: '/' } }).sort({ _id: 1 })
const { data: pages } = await useAsyncData('pages-list', find)
</script>
