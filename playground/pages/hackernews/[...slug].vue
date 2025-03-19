<script setup lang="ts">
const route = useRoute()

const { data } = await useAsyncData('news' + route.path, async () => {
  if (route.path === '/hackernews') {
    return await queryCollection('hackernews').all()
  }

  return await queryCollection('hackernews').where('id', '=', route.params.slug).first()
})
</script>

<template>
  <UPage v-if="data">
    <UPageBody>
      <UBlogPosts v-if="Array.isArray(data)">
        <UBlogPost
          v-for="(post, index) in data"
          :key="index"
          :title="post.title"
          :date="post.date"
          :authors="[{ name: post.by }]"
          :to="post.url"
          :target="'_blank'"
          :badge="{ label: 'Score: ' + post.score.toString() }"
        />
      </UBlogPosts>
      <ContentRenderer
        v-else-if="data"
        :value="data"
      />
    </UPageBody>
  </UPage>
</template>
