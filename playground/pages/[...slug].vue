<template>
  <div>
    Slug: {{ route.path }}
    <br>
    <router-link to="/">
      Home
    </router-link>
    <router-link to="/repository/commands">
      Commands
    </router-link>

    <Content v-if="page" :id="page.id" />
    <div v-else>
      Not Found!
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const { data: page } = useAsyncData('page-content', async () => {
  return (await useContentQuery().where({ slug: route.path }).fetch()).pop()
})
</script>
