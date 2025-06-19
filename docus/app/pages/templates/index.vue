<script setup lang="ts">
const siteConfig = useSiteConfig()

const { data: page } = await useAsyncData('templates-landing', () => queryCollection('landing').path('/templates').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: templates } = await useAsyncData('templates', () => queryCollection('templates').where('draft', '=', 0).all())

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
            v-for="(template, index) in templates"
            :key="index"
            :title="template.title"
            :description="template.description"
            :image="template.mainScreen"
            :to="`/templates/${template.slug}`"
            :ui="{
              root: 'hover:ring-2 hover:ring-(--ui-primary)',
              description: 'text-pretty',
              image: 'group-hover:scale-100',
              header: 'aspect-auto',
            }"
          >
            <template #date>
              <UBadge
                :label="TEMPLATE_BADGES[template.licenseType].label"
                :color="TEMPLATE_BADGES[template.licenseType].color"
                variant="outline"
              />
            </template>
          </UBlogPost>
        </UBlogPosts>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
