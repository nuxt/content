<script setup lang="ts">
import { useDocus } from '#imports'

const { theme, page } = useDocus()
</script>

<template>
  <div id="docus-page" class="flex min-h-screen w-full flex-col">
    <Navbar />
    <ArticleHero :page="page" />
    <div class="px-4 sm:px-6 mx-auto max-w-full lg:max-w-7xl flex h-full ">
      <NuxtPage />
    </div>
    <Footer />
  </div>
</template>
