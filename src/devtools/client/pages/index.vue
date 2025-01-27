<script setup lang="ts">
import { ref } from 'vue'

const currentTable = ref('')
</script>

<template>
  <NSplitPane
    :min-left="30"
  >
    <template #left>
      <Sidebar v-model="currentTable" />
    </template>
    <template #right>
      <Details
        v-if="currentTable"
        :table="currentTable"
      />
      <div
        v-else
        class="n-panel-grids-center"
      >
        <div
          class="n-card n-card-base"
          px6
          py2
        >
          <span
            op75
            flex
            items-center
          >
            <NIcon
              icon="i-carbon-db2-buffer-pool"
              mr2
            />
            Select a table to view its details
          </span>
        </div>
      </div>
    </template>
  </NSplitPane>
</template>
