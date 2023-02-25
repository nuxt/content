<script setup lang="ts">
const query = {
  path: '/dogs',
  limit: 10,
  where: [{
    _partial: false
  }]
}
</script>

<template>
  <ContentList :query="query">
    <template #default="{ list }">
      [{{ list.map(i => i.title).join(',') }}]
    </template>
    <template #not-found>
      <p>No articles found</p>
    </template>
  </ContentList>
</template>
