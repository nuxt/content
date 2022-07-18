<template>
  <div style="max-width: 680px; margin: 0 auto">
    <NuxtLoadingBar />

    <PageNav />

    <slot />
  </div>
</template>

<style>
body, html {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  min-width: 100vw;
}
</style>
