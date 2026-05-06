<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

const { status, search } = useSearchCollection(['nuxt', 'vue'])

const query = ref('')
const results = ref<Awaited<ReturnType<typeof search>>>([])
const searchTime = ref(0)
const loading = ref(false)

async function onSearch() {
  if (!query.value.trim()) {
    results.value = []
    return
  }

  loading.value = true
  const start = performance.now()

  try {
    results.value = await search(query.value, {
      limit: 20,
      snippet: { column: 'content', around: 40 },
    })
  }
  catch (e) {
    console.error('Search error:', e)
    results.value = []
  }

  searchTime.value = Math.round(performance.now() - start)
  loading.value = false
}

const debouncedSearch = useDebounceFn(onSearch, 200)

watch(query, debouncedSearch)
</script>

<template>
  <div class="py-8 space-y-6">
    <div>
      <h1 class="text-2xl font-bold mb-2">
        FTS5 Search
      </h1>
      <p class="text-muted">
        Full-text search powered by SQLite FTS5. Supports prefix queries (word*), phrase matching ("exact phrase"), and boolean operators (word1 OR word2).
      </p>
    </div>

    <div class="flex items-center gap-2">
      <UInput v-model="query" placeholder="Search content..." icon="i-lucide-search" size="lg" autofocus />

      <div v-if="status === 'loading'" class="text-sm text-dimmed">
        Building search index...
      </div>

      <div v-else-if="searchTime > 0" class="text-sm text-dimmed">
        {{ results.length }} results in {{ searchTime }}ms
      </div>
    </div>

    <div v-if="loading" class="text-dimmed">
      Searching...
    </div>

    <div v-else-if="results.length" class="space-y-3">
      <UCard v-for="result in results" :key="result.id">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <NuxtLink :to="result.id" class="font-semibold text-primary hover:underline">
              {{ result.title }}
            </NuxtLink>
            <UBadge variant="subtle" size="xs">
              h{{ result.level }}
            </UBadge>
          </div>

          <div v-if="result.titles.length" class="text-sm text-muted">
            {{ result.titles.join(' > ') }}
          </div>

          <p v-if="result.snippet" class="text-sm text-dimmed" v-html="result.snippet" />
          <p v-else class="text-sm text-dimmed">
            {{ result.content?.slice(0, 150) }}
          </p>

          <div class="text-xs text-muted">
            rank: {{ result.rank.toFixed(3) }}
          </div>
        </div>
      </UCard>
    </div>

    <div v-else-if="query && !loading" class="text-dimmed">
      No results found.
    </div>
  </div>
</template>
