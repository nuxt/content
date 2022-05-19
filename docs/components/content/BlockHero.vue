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
  <section class="py-6 sm:py-12 lg:py-24">
    <Container padded class="my-16 flex flex-col lg:flex-row">
      <div class="mb-8 flex flex-col items-center pr-0 lg:mb-0 lg:w-2/3 lg:items-start lg:pr-8">
        <NuxtLink v-if="announcement" :to="announcement[1]" class="hover:bg-primary-200 text-primary-900 bg-primary-100 transition dark:bg-transparent hover:dark:bg-primary-900 dark:border-primary-700 dark:text-primary-100 border border-primary-400 mb-8 px-4 py-2 rounded-md flex gap-x-1 flex items-center justify-center">
          <Icon name="heroicons-solid:sparkles" class="h-4 w-4" />
          <span class="font-medium text-sm">{{ announcement[0] }}</span>
        </NuxtLink>

        <h2 class="mb-8 text-center text-5xl font-semibold tracking-tighter text-gray-900 dark:text-gray-100 sm:text-6xl sm:leading-none lg:text-left lg:text-7xl">
          <Markdown use="title" unwrap="p" />
        </h2>

        <p class="leading-base mb-8 text-center text-lg font-medium tracking-tight text-gray-700 dark:text-gray-300 sm:text-xl lg:text-left xl:text-xl">
          <Markdown use="description" unwrap="p" />
        </p>

        <div class="flex flex-col items-center space-y-4 sm:mb-4 sm:flex-row sm:space-y-0 sm:space-x-4 lg:space-x-6">
          <ButtonLink v-if="cta" class="mx-auto md:mx-0" bold size="large" :href="(cta[1] as any)">
            {{ cta[0] }}
          </ButtonLink>
          <a
            v-if="secondary"
            :href="(secondary[1] as any)"
            class="text-secondary-active border-b-1 hover:border-primary-500 dark:hover:border-primary-400 mt-px border-transparent py-px font-medium"
          >
            {{ secondary[0] }}
          </a>
        </div>
      </div>

      <div v-if="snippet" class="sm:w-580px mx-auto w-full lg:w-1/3">
        <div class="md:mx md:pl-2">
          <Terminal :content="snippet" />
        </div>
      </div>
    </Container>
  </section>
</template>
