<script setup lang="ts">
import { titleCase } from 'scule'

const siteConfig = useSiteConfig()

const { data: page } = await useAsyncData('blog-landing', () => queryCollection('landing').path('/blog').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: posts } = await useAsyncData('blog-posts', () => queryCollection('posts')
  .where('path', 'LIKE', '/blog%')
  .where('draft', '=', 0)
  .order('date', 'DESC')
  .all(),
)

useSeoMeta({
  title: page.value.seo?.title,
  description: page.value.seo?.description,
  ogTitle: page.value.seo?.title,
  ogDescription: page.value.seo?.description,
  ogImage: `${siteConfig.url}/social.png`,
  twitterImage: `${siteConfig.url}/social.png`,
})
</script>

<template>
  <UPage>
    <UPageHero
      :title="page?.title"
      :description="page?.description"
    />

    <UPageBody>
      <UContainer>
        <UBlogPosts>
          <UBlogPost
            v-for="(post, index) in posts"
            :key="index"
            v-bind="post"
            :to="post.path"
            :badge="titleCase(post.category!)"
            variant="naked"
            :ui="{ header: 'aspect-auto' }"
          />
        </UBlogPosts>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
