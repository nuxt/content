<script setup lang="ts">
import { computedAsync, useVirtualList } from '@vueuse/core'
import { computed, watch, ref } from 'vue'
import { rpc } from '../composables/rpc'

const loading = ref(true)
const sortColumn = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')
// TDOO: add more advanced filtering, add debounce and ...
const filters = ref<Record<string, string>>({})

const props = defineProps<{
  table: string
}>()

const rows = computedAsync(() => {
  loading.value = true
  return rpc.value?.sqliteTable(props.table).then((data) => {
    loading.value = false
    return data
  })
})

const columns = computed(() => rows.value?.length ? Object.keys(rows.value[0]) : [])

const filteredRows = computed(() => {
  if (!rows.value) return []

  // Apply filters
  let result = rows.value.filter((row) => {
    return Object.entries(filters.value).every(([key, value]) => {
      return row[key]?.toString().toLowerCase().includes(value.toLowerCase())
    })
  })

  // Apply sorting
  if (sortColumn.value) {
    result = [...result].sort((a, b) => {
      const aVal = a[sortColumn.value!]
      const bVal = b[sortColumn.value!]

      if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return result
})

const { list: virtualRows, containerProps, wrapperProps, scrollTo } = useVirtualList(filteredRows, {
  itemHeight: 10,
})

function toggleSort(column: string) {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }
  else {
    sortColumn.value = column
    sortOrder.value = 'asc'
  }
}

function updateFilter(column: string, value: string) {
  filters.value[column] = value
}

watch(() => props.table, () => {
  sortColumn.value = null
  sortOrder.value = 'asc'
  filters.value = {}
  scrollTo(0)
})

function copyAS(format: 'json') {
  const data = filteredRows.value
  if (format === 'json') {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="sticky top-0 z-10 bg-neutral-900 border-b border-gray-400/20 p-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <span class="text-sm">Rows: {{ rows?.length }}</span>
      </div>
      <div class="flex items-center gap-4">
        <!-- TODO -->
        <NButton n="primary sm">
          TABLE INFO
        </NButton>
      </div>
    </div>

    <div
      class="flex flex-col h-full relative"
      :class="loading ? 'overflow-hidden' : 'overflow-auto'"
    >
      <NLoading
        v-if="loading"
        class="absolute z-50"
      >
        Loading ...
      </NLoading>
      <table
        class="table-row"
        v-bind="containerProps"
      >
        <thead class="bg-neutral-950 sticky top-0">
          <tr>
            <th
              v-for="column in columns"
              :key="column"
              class="relative px-4 py-2 text-left text-sm font-bold border-b border-r border-gray-400/20"
            >
              <div class="inline-flex items-center gap-2 sticky left-4">
                {{ column }}
                <NButton
                  n="blue"
                  :icon="sortColumn === column
                    ? (sortOrder === 'asc' ? 'carbon-chevron-up' : 'carbon-chevron-down')
                    : 'carbon-chevron-down'"
                  @click="toggleSort(column)"
                />
              </div>
              <NTextInput
                v-model="filters[column]"
                n="xs"
                type="text"
                class="mt-2"
                placeholder="Filter..."
                @input="updateFilter(column, filters[column])"
              />
            </th>
          </tr>
        </thead>
        <tbody v-bind="wrapperProps">
          <tr
            v-for="item in virtualRows"
            :key="item.index"
            class="hover:bg-neutral-800"
          >
            <td
              v-for="column in columns"
              :key="column"
              class="px-4 py-2 text-sm border-b border-r border-gray-400/20"
            >
              <span
                v-if="item.data[column]"
                class="block truncate max-w-72"
              >
                {{ item.data[column] }}
              </span>
              <span
                v-else
                class="text-neutral-400/40"
              >
                NULL
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="border-t border-gray-400/20 p-2 flex items-center justify-between text-sm">
      <div class="flex items-center gap-4">
        <!-- TODO: add pagination working with virtual scroll -->
        <div class="flex items-center gap-1">
          <NButton
            class="h-full"
            icon="carbon-chevron-left"
            n="primary"
          />
          <NButton disabled>
            x
          </NButton>
          <NButton
            class="h-full"
            icon="carbon-chevron-right"
            n="primary"
          />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span>Copy as</span>
        <NButton
          n="blue"
          class="text-sm"
          @click="copyAS('json')"
        >
          JSON
        </NButton>
      </div>
    </div>
  </div>
</template>
