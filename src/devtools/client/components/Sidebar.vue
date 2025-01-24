<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSqliteTables } from '../composables/state'

const selectedTable = defineModel<string>()

const search = ref('')

const tables = useSqliteTables()

const filteredTables = computed(() => {
  if (tables.value) {
    handleTableSelect(tables.value[0].name)
  }
  if (!search.value)
    return tables.value
  return tables.value
    ?.filter(c => c.name.toLowerCase().includes(search.value.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
})

// const selectedTable = ref('')

function handleTableSelect(table: string) {
  selectedTable.value = table
}
</script>

<template>
  <div class="p-4">
    <NNavbar
      v-model:search="search"
      :placeholder="`${tables?.length ?? '-'} tables in total`"
      no-padding
      class="p-2"
    >
      <template #actions>
        <div
          class="flex items-center gap-2"
        >
          <!-- TODO -->
          <NButton
            n="blue"
            class="w-full"
            icon="carbon-reset"
            title="Refresh"
          />
        </div>
      </template>
    </NNavbar>
    <div class="font-medium text-xs text-neutral-500 my-2 pt-4">
      TABLES
    </div>
    <div class="space-y-2">
      <div
        v-for="table in filteredTables"
        :key="table.name"
        class="flex items-center gap-2 p-2 hover:bg-neutral-800 rounded cursor-pointer text-sm"
        :class="{ 'bg-neutral-800': selectedTable === table.name }"
        @click="handleTableSelect(table.name)"
      >
        <NIcon icon="carbon-chevron-right" />
        <span>{{ table.name }}</span>
      </div>
    </div>
  </div>
</template>
