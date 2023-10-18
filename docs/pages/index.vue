<script setup lang="ts">
definePageMeta({
  colorMode: 'dark'
})

const videoModalOpen = ref(false)
const title = 'Nuxt Content made easy for Vue Developers'
const description = 'Nuxt Content reads the content/ directory in your project, parses .md, .yml, .csv and .json files to create a powerful data layer for your application. Use Vue components in Markdown with the MDC syntax.'

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: 'https://content.nuxt.com/social-card.png',
  twitterImage: 'https://content.nuxt.com/social-card.png'
})

const { data } = await useAsyncData('landing', () => {
  return Promise.all([
    queryContent('/_partials/get-started').findOne(),
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
  transform: ({ stats, contributors }) => ({ stats, contributors })
})
const { format: formatNumber } = Intl.NumberFormat('en-GB', { notation: 'compact' })
</script>

<template>
  <ULandingHero
    align="center"
    direction="vertical"
    :ui="{ base: 'relative z-[1]', container: 'flex flex-col gap-6 lg:gap-8', description: 'mt-6 text-lg/8 lg:px-28 text-gray-400' }"
  >
    <div class="gradient" />
    <div class="flex w-full justify-center order-first">
      <UBadge
        class="w-fit"
        color="primary"
        size="md"
        :ui="{ color: { primary: { solid: 'ring-1 ring-inset ring-primary-700/50 text-primary-400 bg-primary-900/10 hover:bg-primary-900/50 transition-color duration-200' } } }"
      >
        <NuxtLink to="https://nuxt.studio/?utm_source=content-site&utm_medium=hero&utm_campaign=home" target="_blank" rel="noopener">
          Discover Nuxt Studio: the pro version of Content
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
      <UButton
        color="primary"
        label="Get Started"
        icon="i-ph-rocket-launch-duotone"
        to="/get-started/installation"
        size="xl"
      />
      <UButton
        size="xl"
        color="white"
        icon="i-ph-video-duotone"
        label="What is Nuxt Content?"
        @click="videoModalOpen = true"
      />
    </template>
    <UModal v-model="videoModalOpen" :ui="{ width: 'sm:max-w-[560px]' }">
      <div>
        <iframe
          width="560"
          height="315"
          src="https://www.youtube-nocookie.com/embed/o9e12WbKrd8?si=BkxcagvrvXPsAWQh"
          title="Nuxt Content in 3 minutes"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        />
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
        <ULandingCard
          v-for="card in section.toolsCards"
          :key="card.title"
          :to="card.to"
          :icon="card.icon"
          :title="card.title"
          :description="card.description"
          :ui="{ to: 'hover:ring-2 dark:hover:ring-gray-500 hover:ring-gray-500 hover:bg-gray-100/50', icon: { base: 'w-10 h-10 flex-shrink-0 text-gray-100' }, body: { base: 'h-full', background: 'bg-gradient-to-b from-gray-900 to-gray-950' } }"
        />
      </UPageGrid>
    </template>

    <template #get-started>
      <ULandingSection
        align="left"
        :ui="{ links: 'mt-8 flex flex-wrap justify-center lg:justify-start gap-x-3 gap-y-1.5', base: 'text-center lg:text-left flex flex-col items-center lg:items-start' }"
      >
        <template v-if="section.subTitle" #title>
          <span v-html="section?.subTitle" />
        </template>

        <template v-if="section.subDescription" #description>
          <span v-html="section.subDescription" />
        </template>

        <template #links>
          <UButton size="xl" color="transparent" variant="outline" label="Read the documentation" to="/get-started/installation" />

          <UButton
            color="gray"
            label="Explore content themes"
            variant="ghost"
            trailing-icon="i-ph-arrow-square-out"
            to="https://nuxt.new/themes"
            target="_blank"
            class="flex space-x-2 transition-color duration-200"
            size="xl"
          />
        </template>

        <div class="w-full flex flex-col items-center justify-center">
          <div class="flex flex-col space-y-6">
            <div class="flex space-x-4">
              <div class="relative hidden flex-col justify-between pt-[20px] pb-[70px] md:flex">
                <svg
                  width="2"
                  height="295"
                  viewBox="0 0 2 295"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="absolute left-4 -top-10 h-full z-[-1]"
                >
                  <path d="M1 0L1 153" stroke="#334155" stroke-dasharray="4 4" />
                  <path d="M1 142L1 295" stroke="#334155" stroke-dasharray="4 4" />
                </svg>

                <div
                  class="h-8 w-8 flex items-center justify-center border border-1 border-gray-700 rounded-full bg-gray-800 px-4 py-2"
                >
                  1
                </div>
                <div
                  class="h-8 w-8 flex items-center justify-center border border-1 border-gray-700 rounded-full bg-gray-800 px-4 py-2"
                >
                  2
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
      <ULandingCTA
        align="left"
        card
        :ui="{
          background: 'bg-gradient-to-b from-gray-900 to-gray-950',
          body: { background: 'bg-gradient-to-b from-gray-900 to-gray-950' },
          links: 'mt-10 flex flex-col space-y-4 items-center justify-center lg:justify-start gap-x-6',
          title: 'text-2xl font-medium tracking-tight text-white sm:text-3xl text-center lg:text-left',
        }"
      >
        <template #title>
          <span v-html="section.subTitle" />
        </template>

        <template #links>
          <UAvatarGroup :max="13" size="md" class="flex-wrap lg:self-start [&_span:first-child]:text-xs">
            <UTooltip
              v-for="(contributor, index) of module.contributors"
              :key="index"
              :text="contributor.username"
              class="rounded-full"
              :ui="{ background: 'bg-gray-50 dark:bg-gray-800/50' }"
              :popper="{ offsetDistance: 16 }"
            >
              <UAvatar
                :alt="contributor.username"
                :src="`https://ipx.nuxt.com/s_40x40/gh_avatar/${contributor.username}`"
                :srcset="`https://ipx.nuxt.com/s_80x80/gh_avatar/${contributor.username} 2x`"
                class="lg:hover:ring-primary-500 dark:lg:hover:ring-primary-400 transition-transform lg:hover:scale-125 lg:hover:ring-2"
                size="md"
              >
                <NuxtLink
                  :to="`https://github.com/${contributor.username}`"
                  target="_blank"
                  class="focus:outline-none"
                  tabindex="-1"
                >
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
          <NuxtLink class="group text-center" to="https://npmjs.org/package/@nuxt/content" target="_blank">
            <p
              class="group-hover:text-primary-500 dark:group-hover:text-primary-400 text-6xl font-semibold text-gray-900 dark:text-white"
            >
              {{ formatNumber(module.stats.downloads) }}+
            </p>
            <p>Monthly Downloads</p>
          </NuxtLink>

          <NuxtLink class="group text-center" to="https://github.com/nuxt/content" target="_blank">
            <p
              class="group-hover:text-primary-500 dark:group-hover:text-primary-400 text-6xl font-semibold text-gray-900 dark:text-white"
            >
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
        <UButton
          size="xl"
          :label="section.button"
          to="https://nuxt.studio/?utm_source=content-site&utm_medium=section&utm_campaign=home"
          target="_blank"
          rel="noopener"
          class="w-fit"
        />
      </div>

      <div
        ref="videoWrapper"
        class="relative flex items-center justify-center border border-slate-200/10 rounded-xl bg-slate-700/20"
      >
        <div class="p-4">
          <video
            class="rounded-lg bg-slate-800"
            src="https://res.cloudinary.com/nuxt/video/upload/v1695121040/studio/nuxt-studio-intro_p9kph1.mp4"
            poster="https://res.cloudinary.com/nuxt/video/upload/v1695121040/studio/nuxt-studio-intro_p9kph1.jpg"
            muted
            loop
            controls
          />
        </div>
      </div>
    </template>

    <template #start-building>
      <ULandingSection
        align="left"
        :ui="{ base: 'text-center lg:text-left flex flex-col items-center lg:items-start' }"
        class="relative"
      >
        <template v-if="section.subTitle" #title>
          <span v-html="section?.subTitle" />
        </template>

        <template v-if="section.subDescription" #description>
          <span v-html="section.subDescription" />
        </template>

        <div class="rounded-xl bg-gray-900 flex flex-col relative">
          <NuxtLink v-for="(card, index) in section.cards" :key="card.title" :to="card.to">
            <UCard
              class="group"
              :ui="{ shadow: 'none', rounded: 'rounded-xl', ring: 'ring-0', background: 'transparent' }"
            >
              <div class="flex justify-between pb-2">
                <h4 class="font-bold text-lg text-white">
                  {{ card.title }}
                </h4>

                <UIcon
                  name="i-ph-arrow-right"
                  class="text-gray-400 w-5 h-5 group-hover:translate-x-2 group-hover:text-white transition-all duration-200"
                />
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
</template>

<style scoped lang="postcss">
.gradient {
  position: absolute;
  top: 25vh;
  left: 0;
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

video[poster] {
  height: 100%;
  width: 100%;
  object-fit: cover;
}
</style>
