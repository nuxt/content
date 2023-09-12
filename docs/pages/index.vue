<script setup lang="ts">
const videoModalOpen = ref(false)
const title = 'Nuxt Content made easy for Vue Developers'
const description = 'Nuxt Content reads the content/ directory in your project, parses .md, .yml, .csv and .json files to create a powerful data layer for your application. Use Vue components in Markdown with the MDC syntax.'
useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: 'https://content.nuxtjs.org/social-card.png',
  twitterImage: 'https://ccontent.nuxtjs.org/social-card.png',
})

const { data } = await useAsyncData('landing', () => {
  return Promise.all([
    queryContent('/home/get-started').findOne(),
    queryContent('/').findOne()
  ])
})

const [getStarted, page] = data.value

const { data: module } = await useFetch<{
  stats: {
    downloads: number
    stars: number
  }
  contributors: {
    username: string
  }[]
}>('https://api.nuxt.com/modules/content', {
  transform: ({ stats, contributors }) => ({ stats, contributors }),
})

const { format: formatNumber } = Intl.NumberFormat('en-GB', { notation: 'compact' })

</script>

<template>
  <ULandingHero align="center" direction="vertical"
    :ui="{ container: 'flex flex-col lg:gap-12', description: 'mt-6 text-lg/8 lg:px-28 text-gray-400' }">
    <span class="gradient" />

    <div class="flex w-full justify-center order-first pb-4">
      <UBadge class="w-fit" color="primary" size="md"
        :ui="{ color: { primary: { solid: 'ring-1 ring-inset ring-primary-700/50 text-primary-400 bg-primary-900/10 hover:bg-primary-900/50 transition-color duration-200' } } }">
        <NuxtLink to="guide/writing/document-driven">
          Discover the Document Driven Mode
        </NuxtLink>
      </UBadge>
    </div>

    <template #title>
      <span v-html="page.hero?.title" />
    </template>
    <template #description>
      <span v-html="page.hero?.description" />
    </template>
    <template #links>
      <UButton size="xl" color="white" icon="i-ph-video-duotone" label="What is Nuxt Content?"
        @click="videoModalOpen = true" />

      <UButton color="gray" label="Star on GitHub" variant="ghost" trailing-icon="i-simple-icons-github"
        to="https://github.com/nuxt/content" target="_blank" class="flex space-x-2 transition-color duration-200"
        size="xl" />
    </template>
    <UModal v-model="videoModalOpen" :ui="{ width: 'sm:max-w-[560px]' }">
      <div>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/o9e12WbKrd8?si=BkxcagvrvXPsAWQh"
          title="YouTube video player" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen>
        </iframe>
      </div>
    </UModal>
  </ULandingHero>

  <ULandingSection v-for="(section, index) of page.sections" :key="index" v-bind="section">
    <template v-if="section.title" #title>
      <span v-html="section?.title" />
    </template>

    <template v-if="section.description" #description>
      <span v-html="section.description" />
    </template>

    <template #features>
      <UPageGrid>
        <UPageCard v-for="card in section.toolsCards" :key="card.title" :to="card.to" :icon="card.icon"
          :title="card.title" :description="card.description"
          :ui="{ to: 'hover:ring-2 dark:hover:ring-gray-500 hover:ring-gray-500 hover:bg-gray-100/50', icon: { base: 'w-10 h-10 flex-shrink-0 text-gray-100' }, body: { base: 'h-full', background: 'bg-gradient-to-b from-gray-900 to-gray-950' } }" />
      </UPageGrid>
    </template>

    <template #get-started>
      <ULandingSection align="left"
        :ui="{ links: 'mt-8 flex flex-wrap justify-center lg:justify-start gap-x-3 gap-y-1.5', base: 'text-center lg:text-left flex flex-col items-center lg:items-start' }">

        <template v-if="section.subTitle" #title>
          <span v-html="section?.subTitle" />
        </template>

        <template v-if="section.subDescription" #description>
          <span v-html="section.subDescription" />
        </template>

        <template #links>
          <UButton size="xl" color="transparent" variant="outline" label="Read the documentation" to="/get-started" />

          <UButton color="gray" label="Explore content theme" variant="ghost" trailing-icon="i-ph-arrow-square-out"
            to="https://nuxt.new/themes" target="_blank" class="flex space-x-2 transition-color duration-200" size="xl" />
        </template>

        <div class="w-full flex flex-col items-center justify-center">
          <div class="flex flex-col space-y-6">
            <div class="flex space-x-4">
              <div class="relative hidden flex-col justify-between pt-[20px] pb-[130px] md:flex">
                <svg width="2" height="295" viewBox="0 0 2 295" fill="none" xmlns="http://www.w3.org/2000/svg"
                  class="absolute left-4 -top-10 h-full z-[-1]">
                  <path d="M1 0L1 153" stroke="#334155" stroke-dasharray="4 4" />
                  <path d="M1 142L1 295" stroke="#334155" stroke-dasharray="4 4" />
                </svg>

                <div
                  class="h-8 w-8 flex items-center justify-center border border-1 border-gray-700 rounded-full bg-gray-800 px-4 py-2">
                  1
                </div>
                <div
                  class="h-8 w-8 flex items-center justify-center border border-1 border-gray-700 rounded-full bg-gray-800 px-4 py-2">
                  2
                </div>
                <div
                  class="h-8 w-8 flex items-center justify-center border border-1 border-gray-700 rounded-full bg-gray-800 px-4 py-2">
                  3
                </div>
              </div>
              <div class="prose">
                <ContentRenderer :value="getStarted" />
              </div>
            </div>
          </div>
        </div>
      </ULandingSection>
    </template>


    <template #cta>
      <ULandingCTA align="left" card :ui="{
        background: 'bg-gradient-to-b from-gray-900 to-gray-950',
        body: { background: 'bg-gradient-to-b from-gray-900 to-gray-950' },
        links: 'mt-10 flex flex-col space-y-4 items-center justify-center lg:justify-start gap-x-6',
        title: 'text-2xl font-medium tracking-tight text-white sm:text-3xl text-center lg:text-left',
      }">
        <template #title>
          <span v-html="section.subTitle" />
        </template>

        <template #links>
          <UAvatarGroup :max="13" size="md" class="flex-wrap lg:self-start [&_span:first-child]:text-xs">
            <UTooltip v-for="(contributor, index) of module.contributors" :key="index" :text="contributor.username"
              class="rounded-full" :ui="{ background: 'bg-gray-50 dark:bg-gray-800/50' }"
              :popper="{ offsetDistance: 16 }">
              <UAvatar :alt="contributor.username" :src="`https://github.com/${contributor.username}.png`"
                class="lg:hover:ring-primary-500 dark:lg:hover:ring-primary-400 transition-transform lg:hover:scale-125 lg:hover:ring-2"
                size="md">
                <NuxtLink :to="`https://github.com/${contributor.username}`" target="_blank" class="focus:outline-none"
                  tabindex="-1">
                  <span class="absolute inset-0" aria-hidden="true" />
                </NuxtLink>
              </UAvatar>
            </UTooltip>
          </UAvatarGroup>
          <p class="text-center text-sm">
            {{ section.avatarText }}
          </p>
        </template>

        <div class="flex flex-col items-center justify-center gap-8 sm:flex-row lg:gap-16">
          <NuxtLink class="group text-center" to="https://npmjs.org/package/@nuxt/devtools" target="_blank">
            <p
              class="group-hover:text-primary-500 dark:group-hover:text-primary-400 text-6xl font-semibold text-gray-900 dark:text-white">
              {{ formatNumber(module.stats.downloads) }}+
            </p>
            <p>Monthly Downloads</p>
          </NuxtLink>

          <NuxtLink class="group text-center" to="https://github.com/nuxt/devtools" target="_blank">
            <p
              class="group-hover:text-primary-500 dark:group-hover:text-primary-400 text-6xl font-semibold text-gray-900 dark:text-white">
              {{ formatNumber(module.stats.stars) }}+
            </p>
            <p>Stars</p>
          </NuxtLink>
        </div>
      </ULandingCTA>
    </template>

    <template #meet-studio>
      <ul class="flex flex-wrap space-x-4 lg:px-28 xl:px-40 items-center justify-center sm:-mt-16">
        <li v-for="(item, index) in section.list" :key="index" class="my-2">
          <UIcon name="i-ph-check" class="w-4 h-4 text-green-400 mr-2" />
          <span class="text-gray-200 text-lg">{{ item }}</span>
        </li>
      </ul>
      <div class="w-full flex justify-center sm:-mt-12">
        <UButton size="xl" :label="section.button" to="https://nuxt.studio/" target="_blank" class="w-fit" />
      </div>

      <VideoPlayer :source="{ type: 'mp4', src: '/video/studio.mp4' }" poster="/video/poster-studio.webp" />
    </template>

    <template #start-building>
      <ULandingSection align="left" :ui="{ base: 'text-center lg:text-left flex flex-col items-center lg:items-start' }">
        <template v-if="section.subTitle" #title>
          <span v-html="section?.subTitle" />
        </template>

        <template v-if="section.subDescription" #description>
          <span v-html="section.subDescription" />
        </template>

        <div class="rounded-xl bg-gray-900 flex flex-col relative">
          <NuxtLink v-for="(card, index) in section.cards" :key="card.title" :to="card.to">
            <UCard class="group"
              :ui="{ shadow: 'none', rounded: 'rounded-xl', ring: 'ring-0', background: 'transparent' }">

              <div class="flex justify-between pb-2">
                <h4 class="font-bold text-lg text-white">
                  {{ card.title }}
                </h4>

                <UIcon name="i-ph-arrow-right"
                  class="text-gray-400 w-5 h-5 group-hover:translate-x-2 group-hover:text-white transition-all duration-200" />
              </div>
              <p class="group-hover:text-white transition-color duration-200">
                {{ card.description }}
              </p>
              <div class="absolute h-[1px] flex items-center top-1/2 inset-0">
                <div class="h-[1px] w-full bg-gray-700" :class="index === 0 ? 'block' : 'hidden'" />
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </ULandingSection>
    </template>
  </ULandingSection>



  <!--<template #project>
      <div>
        <div ref="nuxtProjectsSection" class="flex flex-row gap-x-12">
          <ul class="flex flex-col items-center justify-center lg:w-[40%]">
            <li v-for="(project, index) in section.projectCards" :key="index">
              <UCard class="relative hidden lg:block cursor-pointer group"
                :ui="{ background: 'bg-transparent dark:bg-transparent', sahdow: 'none', ring: 'ring-0', body: { background: 'bg-transparent dark:bg-transparent', base: 'flex flex-col space-y-2' } }">
                <div class="absolute inset-0 h-full w-full" @click="selectProjectCard(index)" />
                <h4 class="text-xl font-medium group-hover:text-white transition-color duration-200"
                  :class="currentStep === index ? 'text-white ' : 'text-gray-400'">
                  {{ project.title }}
                </h4>
                <p class="group-hover:text-gray-400 transition-color duration-200"
                  :class="currentStep === index ? 'text-gray-400' : 'text-gray-600'">
                  {{ project.description }}
                </p>
                <UButton trailing variant="link" color="white" size="md" :ui="{ size: { md: 'text-md' } }"
                  class="-ml-2.5 z-20" :to="project.to">
                  <span class="group-hover:text-white transition-color duration-200" :class="currentStep === index ? 'text-white' : 'text-gray-400'">Learn more</span>
                  <UIcon name="i-ph-arrow-right" class="w-5 h-5 group-hover:text-white"
                    :class="currentStep === index ? 'text-white' : 'text-gray-400'" />
                </UButton>
              </UCard>

              <ULandingSection align="center"
                :icon="index === 0 ? 'i-ph-tree-structure' : index === 1 ? 'i-ph-circles-three' : 'i-ph-function'"
                class="lg:hidden"
                :ui="{ base: 'flex flex-col items-center', wrapper: 'py-8 sm:py-12', icon: { wrapper: 'relative rounded-lg flex items-center justify-center mb-6 w-10 h-10 bg-gray-700 flex-shrink-0' }, title: 'text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl' }">
                <template #title>
                  {{ project.title }}
                </template>
                <template #description>
                  {{ project.description }}
                </template>
                <div
                  class="relative h-full place-self-center items-center justify-center border border-slate-200/10 rounded-xl bg-slate-700/20 lg:hidden">
                  <div class="p-4">
                    <NuxtImg :src="`/images/${index === 0 ? 'pages' : index === 1 ? 'components' : 'imports'}.webp`"
                      class="rounded-lg" />
                  </div>
                </div>
              </ULandingSection>
            </li>
          </ul>
          <div
            class="relative hidden h-full place-self-center items-center justify-center border border-slate-200/10 rounded-xl bg-slate-700/20 lg:w-[60%] lg:flex">
            <div class="p-4">
              <NuxtImg :src="`/images/${currentStep === 0 ? 'pages' : currentStep === 1 ? 'components' : 'imports'}.webp`"
                class="rounded-lg" />
            </div>
          </div>
        </div>

        <div class="w-full flex justify-center pt-8">
          <UButton size="xl" variant="outline" color="transparent" to="/guide/features">
            {{ section.button }}
          </UButton>
        </div>
      </div>
    </template>

    <template #cta>
      <ULandingCTA align="left" card :ui="{
        background: 'bg-gradient-to-b from-gray-900 to-gray-950',
        body: { background: 'bg-gradient-to-b from-gray-900 to-gray-950' },
        links: 'mt-10 flex flex-col space-y-4 items-center justify-center lg:justify-start gap-x-6',
        title: 'text-2xl font-medium tracking-tight text-white sm:text-3xl text-center lg:text-left',
      }">
        <template #title>
          <span v-html="section.title" />
        </template>

        <template #links>
          <UAvatarGroup :max="13" size="md" class="flex-wrap lg:self-start [&_span:first-child]:text-xs">
            <UTooltip v-for="(contributor, index) of module.contributors" :key="index" :text="contributor.username"
              class="rounded-full" :ui="{ background: 'bg-gray-50 dark:bg-gray-800/50' }"
              :popper="{ offsetDistance: 16 }">
              <UAvatar :alt="contributor.username" :src="`https://github.com/${contributor.username}.png`"
                class="lg:hover:ring-primary-500 dark:lg:hover:ring-primary-400 transition-transform lg:hover:scale-125 lg:hover:ring-2"
                size="md">
                <NuxtLink :to="`https://github.com/${contributor.username}`" target="_blank" class="focus:outline-none"
                  tabindex="-1">
                  <span class="absolute inset-0" aria-hidden="true" />
                </NuxtLink>
              </UAvatar>
            </UTooltip>
          </UAvatarGroup>
          <p class="text-center text-sm">
            {{ section.avatarText }}
          </p>
        </template>

        <div class="flex flex-col items-center justify-center gap-8 sm:flex-row lg:gap-16">
          <NuxtLink class="group text-center" to="https://npmjs.org/package/@nuxt/devtools" target="_blank">
            <p
              class="group-hover:text-primary-500 dark:group-hover:text-primary-400 text-6xl font-semibold text-gray-900 dark:text-white">
              {{ formatNumber(module.stats.downloads) }}+
            </p>
            <p>Monthly Downloads</p>
          </NuxtLink>

          <NuxtLink class="group text-center" to="https://github.com/nuxt/devtools" target="_blank">
            <p
              class="group-hover:text-primary-500 dark:group-hover:text-primary-400 text-6xl font-semibold text-gray-900 dark:text-white">
              {{ formatNumber(module.stats.stars) }}+
            </p>
            <p>Stars</p>
          </NuxtLink>
        </div>
      </ULandingCTA>
    </template>

    <template #get-started>
      <div class="w-full flex flex-col items-center justify-center">
        <div class="flex flex-col space-y-6">
          <div class="flex space-x-4">
            <div class="relative hidden flex-col justify-between py-[20px] md:flex">
              <svg width="1" height="154" viewBox="0 0 1 154" fill="none" xmlns="http://www.w3.org/2000/svg"
                class="absolute left-4 z-[-1]">
                <path d="M0.500244 0.568115L0.500244 153.568" stroke="#334155" stroke-dasharray="4 4" />
              </svg>
              <div
                class="h-8 w-8 flex items-center justify-center border border-1 border-gray-700 rounded-full bg-gray-800 px-4 py-2">
                1
              </div>
              <div
                class="h-8 w-8 flex items-center justify-center border border-1 border-gray-700 rounded-full bg-gray-800 px-4 py-2">
                2
              </div>
            </div>
            <div class="prose">
              <ContentRenderer :value="getStarted" />
            </div>
          </div>
        </div>
        <UButton to="/guide/getting-started" size="xl" :label="section.button" variant="outline" color="transparent"
          class="mt-8 w-fit" />
      </div>
    </template>
  </ULandingSection> -->
</template>

<style scoped lang="postcss">
.gradient {
  position: absolute;
  top: -5vh;
  width: 100%;
  height: 30vh;
  background: radial-gradient(50% 50% at 50% 50%, #00DC82 0%, rgba(0, 220, 130, 0) 100%);
  filter: blur(150px);
  opacity: 0.6;
  z-index: -1;
}

.prose {
  @apply text-white;

  :where(code) {
    @apply text-gray-200;
  }
}
</style>
