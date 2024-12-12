<script setup lang="ts">
const siteConfig = useSiteConfig()

const { data: page } = await useAsyncData('content-landing', () => queryCollection('landing').path('/blog').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: posts } = await useAsyncData('posts', () => queryCollection('posts').where('path', 'LIKE', '/blog%').all())

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
    <!-- <NuxtImg
      src="/page-hero.svg"
      width="1440"
      height="400"
      class="absolute inset-x-0 hidden w-full top-48 xl:top-28 2xl:-mt-24 min-[2000px]:-mt-64 md:block"
      alt="Hero background"
    /> -->

    <UPageHero
      orientation="horizontal"
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
          />
        </UBlogPosts>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
