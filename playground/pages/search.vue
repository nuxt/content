<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

const { status, search } = useSearchCollection('ui', {
  ignoredTags: ['style'],
})

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
      limit: 30,
      snippet: { column: 'content', around: 40 },
    })
    console.log(results.value)
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

<!-- eslint-disable vue/no-v-html -->
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
      <UInput
        v-model="query"
        placeholder="Search content..."
        icon="i-lucide-search"
        size="lg"
        autofocus
      />

      <div
        v-if="status === 'loading'"
        class="text-sm text-dimmed"
      >
        Building search index...
      </div>

      <div
        v-else-if="searchTime > 0"
        class="text-sm text-dimmed"
      >
        {{ results.length }} results in {{ searchTime }}ms
      </div>
    </div>

    <div
      v-if="loading"
      class="text-dimmed"
    >
      Searching...
    </div>

    <div
      v-else-if="results.length"
      class="space-y-3"
    >
      <UCard
        v-for="result in results"
        :key="result.id"
        :ui="{ body: 'sm:p-4' }"
      >
        <div>
          <div class="flex items-center gap-1 text-sm">
            <div
              v-if="result.titles.length"
              class="text-dimmed"
            >
              {{ result.titles.join(' > ') }}
              >
            </div>

            <NuxtLink
              :to="`https://ui.nuxt.com${result.id}`"
              class="font-semibold text-primary hover:underline"
            >
              {{ result.title }}
            </NuxtLink>

            <UBadge
              :label="`h${result.level}`"
              variant="subtle"
              size="sm"
              class="ms-1"
            />

            <div class="text-sm text-dimmed ms-auto">
              rank: {{ result.rank.toFixed(3) }}
            </div>
          </div>

          <p
            v-if="result.snippet"
            class="text-sm text-muted [&_mark]:underline [&_mark]:text-highlighted [&_mark]:bg-transparent mt-1"
            v-html="result.snippet"
          />
          <p
            v-else-if="result.content"
            class="text-sm text-muted mt-1"
          >
            {{ result.content?.slice(0, 150) }}
          </p>
        </div>
      </UCard>
    </div>

    <div
      v-else-if="query && !loading"
      class="text-dimmed"
    >
      No results found.
    </div>
  </div>
</template>
