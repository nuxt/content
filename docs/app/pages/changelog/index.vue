<script setup lang="ts">
const marker = useTemplateRef<HTMLDivElement>('marker') as Ref<HTMLDivElement>
const dots = useTemplateRef('dots') as Ref<HTMLDivElement[]> as Ref<HTMLDivElement[]>
const container = useTemplateRef('container') as Ref<HTMLDivElement[]>
// const clotherPoint = ref<boolean>(true)
const markerTop = ref(0)
const PAGE_SIZE = 2
const loadedPages = ref(1)

const { y } = useWindowScroll()
const { isScrolling } = useScroll(document)

const siteConfig = useSiteConfig()

const { data: page } = await useAsyncData('content-landing', () => queryCollection('landing').path('/changelog').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: posts } = await useAsyncData('posts', () => queryCollection('posts').where('path', 'LIKE', '/changelog%').all())

console.log('posts.value :', posts.value)

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
// function loadMore() {
//   loadedPages.value++
// }

onMounted(() => {
  // console.log('dot.value :', dot.value)
  // console.log('container.value :', container.value)
  marker.value.style.left = `${container.value[0]!.offsetLeft + 3}px`
})

watch(() => y.value, () => {
  markerTop.value = y.value

  //   const mobilePointTop = dot.value.getBoundingClientRect().top + window.scrollY

  //   const fixedPoints = dots.value.map((point) => {
  //     return point.getBoundingClientRect().top + window.scrollY
  //   })

//   if (!(arrivedState.top || arrivedState.bottom)) {
//     for (let i = 0; i < fixedPoints.length; i++) {
//       if (Math.abs(mobilePointTop - fixedPoints[i]!) <= 100) {
//         dots.value[i]!.classList.add('neon')
//         clotherPoint.value = true
//       }
//       else {
//         if (dots.value[i]!.classList.value.includes('neon')) {
//           dots.value[i]!.classList.remove('neon')
//           clotherPoint.value = false
//         }
//       }
//     }
//   }
})
// watch(() => arrivedState.top, () => {
//   console.log('arrivedState.top :', arrivedState.top)
//   if (arrivedState.top === true) {
//     dots.value[0]!.classList.add('neon')
//   }
// })
// watch(() => arrivedState.bottom, () => {
//   console.log('arrivedState.bottom :', arrivedState.bottom)
//   if (arrivedState.bottom === true) {
//     dots.value[dots.value.length - 1]!.classList.add('neon')
//   }
// })
</script>

<template>
  <UContainer>
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
    >
      <template #links>
        <UButton
          to="https://x.com/nuxtstudio"
          icon="i-simple-icons-x"
          size="sm"
          target="_blank"
          aria-label="Follow studio on X"
        >
          @nuxtstudio
        </UButton>
      </template>
    </UPageHero>

    <UPageBody class="relative">
      <div
        ref="marker"
        class="hidden lg:block absolute rounded-full bg-gray-500 dark:bg-gray-400 z-10 neon marker"
        :style="{ top: `${markerTop}px`, height: `${isScrolling ? 40 : 0}px`, width: '2px' }"
      />
      <ul class="flex flex-col">
        <li
          v-for="(post, index) in paginatedPosts"
          :key="post.id"
          class="flex flex-col"
        >
          <div class="flex w-full flex-col lg:flex-row last:mb-[2px] group">
            <div class="flex w-full pb-4 lg:w-[200px] lg:pb-0 -mt-1">
              <p class="text-sm text-gray-600 dark:text-gray-300">
                <time class="top-24">{{ formatDateByLocale(post.date) }}</time>
              </p>
            </div>
            <div
              ref="container"
              class="relative hidden lg:flex lg:min-w-[150px] lg:w-[150px]"
            >
              <div
                ref="dots"
                class="z-10 hidden w-2 h-2 rounded-full lg:block left-4 top-24 bg-[var(--ui-primary)]"
                :class="{ neon: index === 0 }"
              />

              <div class="absolute left-[3.5px] top-0.5 h-full w-[1px] bg-[var(--ui-primary)]" />
            </div>
            <div class="w-full pb-32">
              <div class="group">
                <!-- <NuxtLink
                  :to="post.path"
                  :aria-label="post.title"
                  class="absolute inset-0 z-10"
                /> -->
                <NuxtImg
                  v-bind="post.image"
                  loading="lazy"
                  width="915"
                  height="515"
                  class="aspect-[16/9] object-cover rounded-md group-hover:scale-105 transition duration-300 h-full"
                />

                <!-- <div class="flex flex-col">
                  <h2 class="text-4xl font-semibold">
                    {{ post.title }}
                  </h2>
                  <p
                    v-if="post.description"
                    class="pt-2 pb-4 text-lg text-gray-500 dark:text-gray-400"
                  >
                    {{ post.description }}
                  </p>
                  <div class="flex flex-wrap items-center gap-6 mt-4">
                    <UButton
                      v-for="author in post.authors"
                      :key="author.name"
                      :to="author.to"
                      target="_blank"
                      variant="ghost"
                      class="-my-1.5 -mx-2.5"
                      :aria-label="author.name"
                    >
                      <UAvatar v-bind="author.avatar" />

                      <div class="text-left">
                        <p class="font-medium">
                          {{ author.name }}
                        </p>
                        <p
                          v-if="author.to"
                          class="leading-4 text-gray-500 dark:text-gray-400"
                        >
                          {{ `@${author.to.split('/').pop()}` }}
                        </p>
                      </div>
                    </UButton>
                  </div>
                </div> -->
              </div>
            </div>
          </div>
          <!-- <div
            v-if="index === paginatedPosts.length - 1 && canLoadMore"
            class="z-10 flex justify-center -mt-16 lg:col-span-4 lg:ml-48"
          >
            <UButton
              size="sm"
              label="Load more"
              aria-label="Load more"
              @click="loadMore"
            />
          </div> -->
        </li>
      </ul>
    </UPageBody>
  </UContainer>
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
