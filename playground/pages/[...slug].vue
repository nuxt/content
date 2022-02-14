<template>
  <div>
    <PageNav />

    <hr>

    <Content v-if="page" :id="page.id" />
    <div v-else>
      Not Found!
    </div>

    <PagePrevNext v-if="page" :page="page" />
  </div>
</template>

<script setup lang="ts">
import { ParsedContentMeta } from '../../src/runtime/types'

const route = useRoute()

const { fetch } = useContentQuery(route.path)

const { data: page } = await useAsyncData('page-content', () => fetch() as Promise<ParsedContentMeta>)
</script>
