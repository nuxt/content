<script lang="ts" setup>
const { data } = await useAsyncData('posts', () => {
  return queryCollection('posts')
    .select('title', 'description', 'image', 'path', 'date')
    .all()
})
</script>

<template>
  <UContainer>
    <h1 class="text-4xl font-bold text-center my-8">
      <span>My Blog</span>
    </h1>
    <UBlogList orientation="vertical">
      <UBlogPost
        v-for="post in data"
        :key="post.path"
        :title="post.title"
        :path="post.path"
        :image="post.image"
        :to="post.path"
        :date="post.date"
        :description="post.description"
        orientation="horizontal"
      />
    </UBlogList>
  </UContainer>
</template>
