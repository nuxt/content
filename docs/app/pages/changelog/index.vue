<script setup lang="ts">
const containers = useTemplateRef<HTMLDivElement[]>('containers') as Ref<HTMLDivElement[]>
const marker = useTemplateRef<HTMLDivElement>('marker') as Ref<HTMLDivElement>
const dots = useTemplateRef<HTMLDivElement[]>('dots') as Ref<HTMLDivElement[]>
const markerTop = ref(0)
const PAGE_SIZE = 5
const loadedPages = ref(1)

const { y } = useWindowScroll()
const { isScrolling, arrivedState } = useScroll(document)

const siteConfig = useSiteConfig()

const { data: page } = await useAsyncData('changelog', () => queryCollection('landing').path('/changelog').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: posts } = await useAsyncData('changelog-posts', () => queryCollection('posts').where('path', 'LIKE', '/changelog%').all())

useSeoMeta({
  title: page.value.seo?.title,
  description: page.value.seo?.description,
  ogTitle: page.value.seo?.title,
  ogDescription: page.value.seo?.description,
  ogImage: `${siteConfig.url}/social.png`,
  twitterImage: `${siteConfig.url}/social.png`,
})

const paginatedPosts = computed(() => canLoadMore.value ? posts.value?.slice(0, loadedPages.value * PAGE_SIZE) || [] : posts.value || [])
const canLoadMore = computed(() => (posts.value?.length || 0) / PAGE_SIZE > loadedPages.value)
function loadMore() {
  loadedPages.value++
}

watch(() => y.value, () => {
  markerTop.value = y.value

  for (let i = 0; i < dots.value.length; i++) {
    // Height is the sum of all the previous containers
    const containersHeight = containers.value.map(container => container.getBoundingClientRect().height)
    const height = containersHeight.slice(0, i).reduce((acc, curr) => acc + curr, 0)

    // If the marker is located between the top of the container and the bottom of the container (variant with the gap), it is hightlighted
    const GAP = 150
    if (markerTop.value >= height - GAP && markerTop.value <= height + containersHeight[i]! - GAP) {
      dots.value[i]!.classList.add('neon')
    }
    else {
      dots.value[i]!.classList.remove('neon')
    }
  }
})

watch(() => arrivedState.bottom, () => {
  if (arrivedState.bottom && canLoadMore.value) {
    loadMore()
  }
})
</script>

<template>
  <UPage>
    <NuxtImg
      src="/page-hero.svg"
      width="1440"
      height="400"
      class="absolute inset-x-0 hidden w-full top-48 xl:top-28 2xl:-mt-24 min-[2000px]:-mt-64 md:block"
      alt="Hero background"
    />

    <UPageHero
      :title="page?.title"
      :description="page?.description"
    />

    <UPageBody>
      <UContainer>
        <div class="relative">
          <div
            ref="marker"
            class="hidden lg:block absolute rounded-full bg-gray-500 dark:bg-gray-400 neon marker"
            :style="{ left: '153px', top: `${markerTop}px`, height: `${isScrolling ? 40 : 0}px`, width: '2px' }"
          />

          <ul class="flex flex-col">
            <li
              v-for="(post, index) in paginatedPosts"
              :key="post.id"
              ref="containers"
              class="flex flex-col"
            >
              <div class="flex flex-col lg:flex-row">
                <div class="flex w-full pb-4 lg:max-w-[150px] lg:pb-0 -mt-2">
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    <time>{{ formatDateByLocale(post.date) }}</time>
                  </p>
                </div>
                <div class="relative hidden lg:flex lg:min-w-[150px]">
                  <div
                    ref="dots"
                    class="hidden w-2 h-2 rounded-full lg:block bg-[var(--ui-primary)]"
                    :class="{ neon: index === 0 }"
                  />

                  <div class="absolute left-[3.5px] top-0.5 h-full w-[1px] bg-[var(--ui-primary)]" />
                </div>
                <div class="pb-32">
                  <div class="group relative">
                    <NuxtLink
                      :to="post.path"
                      :aria-label="post.title"
                      class="absolute inset-0 z-[10]"
                    />
                    <div class="overflow-hidden rounded-md max-w-[915px]">
                      <NuxtImg
                        v-bind="post.image"
                        loading="lazy"
                        width="915"
                        height="515"
                        class="aspect-[16/9] object-cover rounded-md group-hover:scale-105 transition duration-300 h-full"
                        :to="post.path"
                      />
                    </div>

                    <div class="flex flex-col mt-4 gap-4">
                      <div class="flex flex-col">
                        <h2 class="text-2xl font-semibold">
                          {{ post.title }}
                        </h2>
                        <p
                          v-if="post.description"
                          class="text-lg text-gray-500 dark:text-gray-400"
                        >
                          {{ post.description }}
                        </p>
                      </div>
                      <div class="flex gap-6">
                        <UUser
                          v-for="author in post.authors"
                          :key="author.name"
                          :name="author.name"
                          :description="`@${author.to.split('/').pop()}`"
                          :avatar="author.avatar"
                          :to="author.to"
                          size="lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </UContainer>
    </UPageBody>
  </UPage>
</template>

<style lang="postcss" scoped>
.neon {
  box-shadow: 0 0 1px rgba(0, 220, 128),
    0 0 15px rgba(0, 220, 128),
    0 0 1px rgba(0, 220, 128),
    0 0 6px rgba(0, 220, 128),
    0 0 12px rgba(0, 220, 128),
    0 0 22px rgba(0, 220, 128);

  transition: all 1s ease;
}

.marker {
  transition: top 0.2s linear, height 0.4s ease, width 0.3s ease, left 0.3s ease;
}
</style>
