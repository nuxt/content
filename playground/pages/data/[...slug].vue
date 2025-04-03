<script lang="ts" setup>
const route = useRoute()
const { data } = await useAsyncData('data', () => queryCollection('data').path(route.path).first())
</script>

<template>
  <UPage>
    <UPageBody>
      <UCard>
        <template #header>
          <h3>
            Data
          </h3>
        </template>
        <ProsePre class="min-h-[100px]">
          {{ data }}
        </ProsePre>
      </UCard>
    </UPageBody>
  </UPage>
</template>
