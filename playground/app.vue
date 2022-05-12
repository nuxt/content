<template>
  <div>
    <NuxtLoadingBar />
    <PageNav v-if="$route.path !== '/playground'" />
    <hr>
    <NuxtPage />
  </div>
</template>
