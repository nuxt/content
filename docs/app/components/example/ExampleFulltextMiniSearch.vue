<script setup lang="ts">
import MiniSearch from 'minisearch'

const query = ref('')
const { data } = await useAsyncData('search-data', () => queryCollectionSearchSections('docs'))

const miniSearch = new MiniSearch({
  fields: ['title', 'content'],
  storeFields: ['title', 'content'],
  searchOptions: {
    prefix: true,
    fuzzy: 0.2,
  },
})

// Add data to the MiniSearch instance
miniSearch.addAll(toValue(data.value))
const result = computed(() => miniSearch.search(toValue(query)).slice(0, 10))
</script>

<template>
  <UContainer class="p-4">
    <UCard>
      <UInput
        v-model="query"
        placeholder="Search..."
        class="w-full"
      />
      <ul>
        <li
          v-for="link of result"
          :key="link.id"
          class="mt-2"
        >
          <UButton
            variant="ghost"
            class="w-full"
            :to="link.id"
          >
            {{ link.title }}
            <span class="text-gray-500 text-xs">
              {{ link.content?.slice(0, 100) }}...
            </span>
          </UButton>
        </li>
      </ul>
    </UCard>
  </UContainer>
</template>
