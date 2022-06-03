<script lang="ts" setup>
const catsQuery = queryContent('cats')

const numbersQuery = queryContent('numbers')

const dogsQuery = {
  where: [
    { _path: /^\/dogs/ }
  ]
}
</script>

<template>
  <div>
    <ContentNavigation v-slot="{ navigation: catsNav }" :query="catsQuery">
      <div v-if="catsNav">
        {{ JSON.stringify(catsNav) }}

        <NuxtLink
          v-for="link of catsNav[0].children"
          :key="link._path"
          :to="link._path"
          style="margin-right: 1rem;"
        >
          {{ link.navTitle || link.title }}
        </NuxtLink>
      </div>
    </ContentNavigation>
    <br>
    <ContentNavigation v-slot="{ navigation: numbersNav }" :query="numbersQuery">
      <div v-if="numbersNav">
        {{ JSON.stringify(numbersNav) }}

        <NuxtLink
          v-for="link of numbersNav[0].children"
          :key="link._path"
          :to="link._path"
          style="margin-right: 1rem;"
        >
          {{ link.navTitle || link.title }}
        </NuxtLink>
      </div>
    </ContentNavigation>
    <br>
    <ContentNavigation v-slot="{ navigation: dogsNav }" :query="dogsQuery">
      <div v-if="dogsNav">
        {{ JSON.stringify(dogsNav) }}

        <NuxtLink
          v-for="link of dogsNav[0].children"
          :key="link._path"
          :to="link._path"
          style="margin-right: 1rem;"
        >
          {{ link.navTitle || link.title }}
        </NuxtLink>
      </div>
    </ContentNavigation>
  </div>
</template>
