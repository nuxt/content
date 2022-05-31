<script setup lang="ts">
defineProps({
  cta: {
    type: Array,
    default: () => ['Get started', '/get-started']
  },
  secondary: {
    type: Array,
    default: () => ['Open on GitHub', 'https://github.com']
  },
  snippet: {
    type: [String],
    default: () => ''
  },
  announcement: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <section class="py-6 sm:py-12 lg:py-24 lg:pb-16">
    <Container padded class="my-16 flex flex-col items-center lg:flex-row">
      <div class="mb-8 flex flex-col items-center justify-center pr-0 lg:mb-0 lg:w-2/3 lg:items-start lg:pr-12">
        <NuxtLink v-if="announcement" :to="announcement[1]" class="hover:bg-primary-200 text-primary-900 bg-primary-100 transition dark:bg-transparent hover:dark:bg-primary-900 dark:border-primary-700 dark:text-primary-100 border border-primary-400 mb-8 px-4 py-2 rounded-md flex gap-x-1 flex items-center justify-center">
          <Icon name="heroicons-solid:sparkles" class="h-4 w-4" />
          <span class="font-medium text-sm">{{ announcement[0] }}</span>
        </NuxtLink>
        <h1 class="mb-8 text-center text-5xl font-semibold tracking-tighter text-gray-900 dark:text-gray-100 sm:text-6xl sm:leading-none lg:text-left lg:text-7xl lg:pr-16">
          <Markdown use="title" unwrap="p" />
        </h1>
        <p class="leading-base mb-8 text-center text-lg font-medium tracking-tight text-gray-700 dark:text-gray-300 sm:text-xl lg:text-left xl:text-xl">
          <Markdown use="description" unwrap="p" />
        </p>
        <div class="flex flex-col items-center space-y-4 sm:mb-4 sm:flex-row sm:space-y-0 sm:space-x-4 lg:space-x-6">
          <ButtonLink v-if="cta" class="mx-auto md:mx-0 !mb-0" bold size="large" :href="(cta[1] as any)">
            {{ cta[0] }}
          </ButtonLink>

          <a
            v-if="secondary"
            :href="(secondary[1] as any)"
            class="block transition-base transition-colors text-secondary-active border-b border-gray-300 dark:bordwer-gray-500 hover:border-gray-800 dark:hover:border-gray-200 mt-2 py-px font-medium"
          >
            {{ secondary[0] }}
          </a>
        </div>
      </div>

      <div class="sm:w-580px mx-auto lg:w-1/3">
        <VideoPlayer class="border-2 shadow-lg surface-border" poster="/video-cover.jpeg" src="https://www.youtube.com/watch?v=o9e12WbKrd8" />
      </div>
    </Container>
  </section>
</template>
