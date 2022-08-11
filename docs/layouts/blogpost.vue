<script setup lang="ts">
// eslint-disable-next-line import/named
import { useContent } from '#imports'

const { page } = useContent()
</script>

<template>
  <div id="docus-page" class="flex min-h-screen w-full flex-col">
    <Navbar />

    <ArticleHero :page="page" />

    <div class="px-4 sm:px-6 mx-auto max-w-full lg:max-w-7xl h-full pb-6">
      <slot />
    </div>

    <Footer />
  </div>
</template>
