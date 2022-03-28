<template>
  <div>
    <hr>
    <ul>
      <li v-for="page of pages" :key="page.id">
        <span>🔗</span>
        <NuxtLink :to="page.slug">
          {{ page.title }}
        </NuxtLink>
      </li>
    </ul>
    <hr>
  </div>
</template>

<script setup lang="ts">
const { find } = queryContent().where({ $not: { slug: '/' } }).sortBy('id', 'asc')
const { data: pages } = await useAsyncData('pages-list', find)
</script>
