<script setup lang="ts">
const route = useRoute()
const siteConfig = useSiteConfig()

const { data: template } = await useAsyncData(`template-${route.params.slug}`, () => queryCollection('templates').path(route.path).first())
if (!template.value) {
  showError({ statusCode: 404, statusMessage: 'Template Not Found' })
}

useSeoMeta({
  title: template.value?.seo.title,
  description: template.value?.seo.description,
  ogTitle: template.value?.seo.title,
  ogDescription: template.value?.seo.description,
  ogImage: template.value?.mainScreen ? `${siteConfig.url}/${template.value?.mainScreen}` : `${siteConfig.url}/social.png`,
  twitterImage: template.value?.mainScreen ? `${siteConfig.url}/${template.value?.mainScreen}` : `${siteConfig.url}/social.png`,
})

const isNuxtUITemplate = computed(() => template.value?.licenseType === 'nuxt-ui')

const images = computed(() => template.value
  ? [
      template.value.image1,
      template.value.image2,
      template.value.image3,
    ].filter(Boolean)
  : [])
</script>

<template>
  <UContainer>
    <UPage v-if="template">
      <UPageHeader
        :title="template.title"
        :description="template.description"
        :headline="template.category"
      >
        <template #headline>
          <div class="flex flex-col gap-6">
            <UBreadcrumb
              :items="[
                { label: 'Templates',
                  icon: 'i-lucide-image',
                  to: '/templates' },
                { label: template.title },
              ]"
            />
            <div>
              <UBadge
                :label="TEMPLATE_BADGES[template.licenseType].label"
                :color="TEMPLATE_BADGES[template.licenseType].color"
                variant="outline"
              />
            </div>
          </div>
        </template>

        <template #title>
          <div class="flex flex-row gap-3 text-2xl">
            <span class="font-semibold">
              {{ template.title }}
            </span>
            <span class="hidden xl:flex items-center gap-2">
              <span class="text-gray-500 dark:text-gray-400">
                By
              </span>
              <NuxtUILogo
                v-if="isNuxtUITemplate"
                class="h-6 w-auto flex"
              />
              <span
                v-else
                class="font-semibold"
              >{{ template.owner }}</span>
            </span>
          </div>
        </template>

        <template #links>
          <div class="flex gap-3">
            <UButton
              label="Preview"
              color="neutral"
              trailing
              icon="i-ph-arrow-square-out"
              :to="template.demo"
              target="_blank"
            />
            <UButton
              label="Clone on GitHub"
              color="primary"
              variant="solid"
              :to="`https://github.com/${template.owner}/${template.name}/tree/${template.branch}`"
              trailing-icon="i-ph-arrow-right"
            />
          </div>
        </template>
      </UPageHeader>

      <UPageBody>
        <UCarousel
          v-if="images.length"
          v-slot="{ item }"
          dots
          :items="images"
          class="w-full max-w-5xl mx-auto"
        >
          <img
            :src="item"
            class="rounded-lg"
          >
        </UCarousel>

        <ContentRenderer
          v-if="template.body"
          :value="template"
        />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
