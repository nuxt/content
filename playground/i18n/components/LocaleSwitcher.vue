<script setup lang="ts">
const route = useRoute()

const localeLinks = ref([])
const { getLocaleSwitcherLinkList } = useI18n()
const labelMap = {
  en: 'English',
  zh: '中文'
}
watchEffect(
  () => {
    localeLinks.value = getLocaleSwitcherLinkList(route.path)
  }
)
</script>

<template>
  <div>
    <NuxtLink v-for="item in localeLinks" :key="item.to" :to="item.to" :class="{current: item.isCurrent }">
      {{ labelMap[item.locale] }}
    </NuxtLink>
  </div>
</template>

<style scoped>
a{
  margin-right: 5px;
}
a.current{
  text-decoration: none;
}
</style>
