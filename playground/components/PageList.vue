<template>
  <ul>
    <li v-for="page of pages" :key="page.id" class="mt-2">
      <span class="mr-1">🔗</span>
      <NuxtLink class="font-bold" :to="page.slug">
        {{ page.title }}
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
const { data: pages } = await useAsyncData('pages-list', () =>
  queryContent().where({ $not: { slug: '/' } }).fetch()
)
</script>
