<script setup lang="ts">
const { data } = await useAsyncData('contents-list', () => getCollectionNavigation('content'))
</script>

<template>
  <div>
    <ul>
      <li
        v-for="item in data"
        :key="item.path"
      >
        <NuxtLink
          v-if="item.page !== false"
          :to="item.path"
        >
          {{ item.title }}
        </nuxtlink>
        <template v-else>
          {{ item.title }}
          <ul>
            <li
              v-for="child in item.children"
              :key="child.path"
            >
              <NuxtLink :to="child.path">
                {{ child.title }}
              </nuxtlink>
            </li>
          </ul>
        </template>
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
