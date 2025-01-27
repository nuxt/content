<script setup lang="ts">
import { computedAsync, useVirtualList } from '@vueuse/core'
import { computed, watch, ref, shallowRef, onMounted } from 'vue'
import { rpc } from '../composables/rpc'

const loading = ref(true)
const sortColumn = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')
// TDOO: add more advanced filtering, add debounce and ...
const filters = ref<Record<string, string>>({})

const props = defineProps<{
  table: string
}>()

const columns = shallowRef([])

const rows = computedAsync(() => {
  loading.value = true
  return rpc.value?.sqliteTable(props.table).then((data) => {
    columns.value = Object.keys(data[0])
    loading.value = false
    return data
  })
})

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
  itemHeight: 37,
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

const pageSize = 19
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(filteredRows.value.length / pageSize) || 1)

function scrollToPage(page: number) {
  if (page > 0 && page <= totalPages.value) {
    console.log('next page: ', page)
    const index = (page - 1) * pageSize
    scrollTo(index)
    currentPage.value = page
  }
}

const dataBody = ref()

onMounted(() => {
  containerProps.ref.value.addEventListener('scroll', onContainerScroll)
})

function onContainerScroll() {
  if (!containerProps.ref.value) return

  const scrollTop = containerProps.ref.value.scrollTop // Total scroll offset
  const itemHeight = 37 // Each item's height
  const topIndex = Math.floor(scrollTop / itemHeight) // Index of the first visible item
  const newPage = Math.ceil((topIndex + 1) / pageSize) // Calculate the page (1-based)
  console.log('ScrollTop:', scrollTop)
  console.log('Top Index:', topIndex)
  console.log('New Page:', newPage)

  // Update currentPage only if it has changed
  if (newPage !== currentPage.value) {
    currentPage.value = newPage
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="sticky top-0 z-10 bg-neutral-900 border-b border-gray-400/20 p-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <span class="text-sm">
          Rows: {{ rows?.length }}
          <span v-if="Object.keys(filters).length">
            / {{ filteredRows.length }}
          </span>
        </span>
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
      <div v-bind="containerProps">
        <!-- Header -->
        <div class="sticky top-0">
          <div class="flex">
            <TableDataCell
              data="#"
              size="sm"
              class="text-center bg-neutral-950/50 backdrop-blur"
            />
            <TableDataCell
              v-for="column in columns"
              :key="column"
              class="bg-neutral-950/50 backdrop-blur"
            >
              <div class="inline-flex items-center gap-2 sticky left-4">
                {{ column }}
                <NTextInput
                  v-model="filters[column]"
                  n="xs"
                  type="text"
                  placeholder="Filter..."
                  @input="updateFilter(column, filters[column])"
                />
                <NButton
                  n="blue"
                  class="h-full"
                  :icon="sortColumn === column
                    ? (sortOrder === 'asc' ? 'carbon-chevron-up' : 'carbon-chevron-down')
                    : 'carbon-chevron-down'"
                  @click="toggleSort(column)"
                />
              </div>
            </TableDataCell>
          </div>
        </div>
        <!-- Body -->
        <div
          v-bind="wrapperProps"
          ref="dataBody"
        >
          <div
            v-for="{ data, index } in virtualRows"
            :key="index"
            class="flex items-stretch"
            style="height: 37px;"
          >
            <TableDataCell
              :data="(index + 1).toString()"
              size="sm"
              class="text-center"
            />
            <TableDataCell
              v-for="column in columns"
              :key="column"
              :data="data[column]"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-400/20 p-2 flex items-center justify-between text-sm">
      <div class="flex items-center gap-4">
        <!-- TODO: complete pagination: disable, input, ... -->
        <div class="flex items-center gap-1">
          <NButton
            class="h-full"
            icon="carbon-chevron-left"
            n="primary"
            @click="scrollToPage(currentPage - 1)"
          />
          <NButton disabled>
            {{ currentPage }} / {{ totalPages }}
          </NButton>
          <NButton
            class="h-full"
            icon="carbon-chevron-right"
            n="primary"
            @click="scrollToPage(currentPage + 1)"
          />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span>Copy as</span>
        <!-- TODO: add more options -->
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
