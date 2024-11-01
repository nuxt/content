<script setup lang="ts">
import Fuse from 'fuse.js'

const query = ref('')
const { data } = await useAsyncData('search-data', () => queryCollectionSearchSections('docs'))

const fuse = new Fuse(data.value, {
  keys: [
    'title',
    'description',
  ],
})

const result = computed<Array<{ item: typeof data.value[0] }>>(() => fuse.search(toValue(query)).slice(0, 10))
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
          :key="link.item.id"
          class="mt-2"
        >
          <UButton
            variant="ghost"
            class="w-full"
            :to="link.item.id"
          >
            {{ link.item.title }}
            <span class="text-gray-500 text-xs">
              {{ link.item.content?.slice(0, 100) }}...
            </span>
          </UButton>
        </li>
      </ul>
    </UCard>
  </UContainer>
</template>
