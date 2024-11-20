<script setup lang="ts">
const siteConfig = useSiteConfig()

const { data: page } = await useAsyncData('index', () => queryCollection('home').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
  ogTitle: page.value.title,
  ogDescription: page.value.description,
  ogImage: `${siteConfig.url}/social.png`,
  twitterImage: `${siteConfig.url}/social.png`,
})
</script>

<template>
  <div v-if="page">
    <UPageHero
      v-bind="page.hero"
      :ui="{
        title: 'font-semibold sm:text-6xl',
        description: 'sm:text-lg text-[var(--ui-text-toned)] max-w-5xl mx-auto',
      }"
    >
      <template
        v-if="page.hero?.title"
        #title
      >
        <MDC
          :value="page.hero.title"
          unwrap="p"
        />
      </template>

      <UColorModeImage
        v-if="page.hero?.image"
        v-bind="page.hero.image"
        class="z-[-1]"
      />
    </UPageHero>

    <UPageSection
      v-for="(section, index) in page.sections"
      :key="index"
      v-bind="section"
      :ui="{
        title: 'font-semibold lg:text-4xl',
        featureLeadingIcon: 'text-[var(--ui-text-highlighted)]',
        container: section.code ? 'lg:items-start' : '',
        wrapper: section.code ? 'pt-10' : '',
        ...(section.ui || {}),
      }"
    >
      <template
        v-if="section.title"
        #title
      >
        <MDC
          :value="section.title"
          unwrap="p"
        />
      </template>

      <MDC
        v-if="section.code"
        :value="section.code"
      />
      <UColorModeImage
        v-else-if="section.image"
        v-bind="section.image"
        class="z-[-1]"
      />
    </UPageSection>
  </div>
</template>
