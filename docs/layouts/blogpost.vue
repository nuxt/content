<script setup lang="ts">
// eslint-disable-next-line import/named
import { useDocus } from '#imports'

const { page } = useDocus()
</script>

<template>
  <div id="docus-page" class="flex min-h-screen w-full flex-col">
    <Navbar />

    <ArticleHero :page="page" />

    <div class="px-4 sm:px-6 mx-auto max-w-full lg:max-w-7xl h-full pb-6">
      <NuxtPage />
    </div>

    <Footer />
  </div>
</template>
