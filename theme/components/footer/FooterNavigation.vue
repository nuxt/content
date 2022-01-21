<template>
  <nav class="mx-12">
    <ul class="flex flex-row justify-between">
      <li v-for="(links, title) in navigation" :key="title" class="lg:mx-4 xl:mx-8 mb-8">
        <h3 class="font-semibold mb-1.5 font-whyte">{{ title }}</h3>
        <ul>
          <li v-for="link in links" :key="link.title">
            <NuxtLink to="/" class="block d-text-secondary hover:d-text-secondary-hover py-1">
              {{ link.title }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup>
defineProps({
  navigation: {
    type: Object,
    required: true
  }
})
</script>
