<script lang="ts" setup>
const catsQuery = queryContent('cats')
const numbers = queryContent('numbers')
const dogsQuery = {
  where: [
    { _path: /^\/dogs/ }
  ]
}
</script>

<template>
  <ContentNavigation v-for="(q, key) in [dogsQuery, catsQuery, numbers]" v-slot="{ navigation }" :key="key" :query="q">
    <div>
      {{ navigation }}
      <NuxtLink
        v-if="navigation"
        v-for="link of navigation[0].children"
        :key="link._path"
        :to="link._path"
        style="margin-right: 1rem;"
      >
        {{ link.navTitle || link.title }}
      </NuxtLink>
    </div>
    <br>
  </ContentNavigation>
</template>
