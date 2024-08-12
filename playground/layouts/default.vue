<script setup lang="ts">
const { data } = await useAsyncData('contents-list', () => queryContentV3().find())
</script>

<template>
  <div>
    <ul>
      <li
        v-for="item in data"
        :key="item._id"
      >
        <NuxtLink :to="item.path">
          {{ item.title }}
        </nuxtlink>
      </li>
      <li>
        <NuxtLink to="/data/foo">
          Data Foo
        </NuxtLink>
      </li>
    </ul>
    <slot />
  </div>
</template>
