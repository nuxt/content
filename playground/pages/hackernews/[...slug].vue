<script setup lang="ts">
const route = useRoute()

const { data } = await useAsyncData('news' + route.path, async () => {
  if (route.path === '/hackernews') {
    return await queryCollection('hackernews').all()
  }

  return await queryCollection('hackernews').where('id', '=', route.params.slug).first()
})

definePageMeta({
  layout: 'empty',
  layoutTransition: false,
})
</script>

<template>
  <div class="content-page">
    <div v-if="Array.isArray(data)">
      <UCard
        v-for="item in data"
        :key="item.id"
      >
        {{ item }}
        <h2>{{ item.title }}</h2>
        <p>{{ item.date }}</p>
        <p>{{ item.score }}</p>
        <p>{{ item.url }}</p>
        <p>{{ item.author }}</p>
      </UCard>
    </div>
    <ContentRenderer
      v-else-if="data"
      :value="data"
    />
  </div>
</template>
