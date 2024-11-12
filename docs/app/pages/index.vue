<script setup lang="ts">
useSeoMeta({
  title: 'Nuxt Content made easy for Vue Developers',
  description: 'Nuxt Content reads the content/ directory in your project, parses .md, .yml, .csv and .json files to create a powerful data layer for your application. Use Vue components in Markdown with the MDC syntax.',
})
const { data: page } = await useAsyncData('index', () => queryCollection('content').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
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
