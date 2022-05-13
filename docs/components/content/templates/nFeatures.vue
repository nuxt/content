<script setup lang="ts">
defineProps({
  features: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <section class="text-center bg-gray-50 dark:bg-gray-800 flex items-center min-h-screen px-4 sm:px-6 md:px-8">
    <Container>
      <div class="md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto py-20">
        <!-- <Icon name="ui:bolt-alt" /> -->
        <p class="font-semibold text-gray-300">
          <Markdown use="tag" unwrap />
        </p>
        <h2 class="font-semibold text-3xl sm:text-4xl lg:text-5xl py-4">
          <Markdown use="title" unwrap />
        </h2>
        <p class="text-lg text-gray-400 py-4">
          <Markdown use="description" unwrap />
        </p>
      </div>
      <div class="w-3/4 sm:w-full mx-auto pb-20 grid gap-20 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="feature in features" :key="feature.icon">
          <div class="h-24 w-24 mx-auto rounded-full border border-gray-200">
            {{ feature.icon }}
          </div>
          <h3 class="text-xl font-semibold py-4">
            {{ feature.title }}
          </h3>
          <p class="text-gray-400 text-justify">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </Container>
  </section>
</template>
