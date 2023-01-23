<script setup>
import { definePageMeta, useContent, useContentHead } from '#imports'

definePageMeta({
  documentDriven: {
    page: {
      score: {
        $eq: 23.5
      }
    }
  }
})

const { page, surround } = useContent()
useContentHead(page)
</script>

<template>
  <div>
    <ContentRenderer :value="page" />
    <div>
      <div v-if="surround[0]">
        with previous link {{ surround[0]._path }}
      </div>
      <div v-else>
        no previous link
      </div>
      <div v-if="surround[1]">
        with next link {{ surround[1]._path }}
      </div>
      <div v-else>
        no next link
      </div>
    </div>
  </div>
</template>
