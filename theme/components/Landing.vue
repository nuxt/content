<template>
  <div class="flex flex-col items-center justify-center space-y-12 my-12">
    <div class="bg-red absolute top-0 left-0 w-full h-screen -z-1 temp-radial-gradient-class overflow-visible"></div>
    <div class="text-center max-w-48rem">
      <h2 class="text-6xl font-semibold tracking-tight mb-8">
        <Markdown :use="$slots.title" unwrap="p" />
      </h2>
      <p class="text-xl text-warmgray-500">
        <Markdown :use="$slots.description" unwrap="p" />
      </p>
    </div>

    <div class="space-x-2 flex align-start">
      <AppButton size="sm" :href="cta[1]">
        <span class="mr-1">{{ cta[0] }}</span>
        <svg class="w-5 h-5" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
            fill="currentColor"
            fill-rule="evenodd"
            clip-rule="evenodd"
          ></path>
        </svg>
      </AppButton>
      <AppButton v-if="secondary" appearance="ghost" size="sm" :href="secondary[1]">
        <span class="mr-1">{{ secondary[0] }}</span>
        <svg class="w-5 h-5" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3 2C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V8.5C13 8.22386 12.7761 8 12.5 8C12.2239 8 12 8.22386 12 8.5V12H3V3L6.5 3C6.77614 3 7 2.77614 7 2.5C7 2.22386 6.77614 2 6.5 2H3ZM12.8536 2.14645C12.9015 2.19439 12.9377 2.24964 12.9621 2.30861C12.9861 2.36669 12.9996 2.4303 13 2.497L13 2.5V2.50049V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3.70711L6.85355 8.85355C6.65829 9.04882 6.34171 9.04882 6.14645 8.85355C5.95118 8.65829 5.95118 8.34171 6.14645 8.14645L11.2929 3H9.5C9.22386 3 9 2.77614 9 2.5C9 2.22386 9.22386 2 9.5 2H12.4999H12.5C12.5678 2 12.6324 2.01349 12.6914 2.03794C12.7504 2.06234 12.8056 2.09851 12.8536 2.14645Z"
            fill="currentColor"
            fill-rule="evenodd"
            clip-rule="evenodd"
          ></path>
        </svg>
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  cta: {
    type: Array,
    default: () => ['Get Started', '/get-started']
  },
  secondary: {
    type: Array,
    default: () => ['Open on GitHub →', 'https://github.com/docusgen/docus']
  }
})
</script>

<style scoped>
.temp-radial-gradient-class {
  --first-dot: #ecfdf5;
  --second-dot: #fffbeb;
  --third-dot: #e0f2fe;
  background: radial-gradient(circle at 15% 10%, var(--first-dot), rgba(255, 255, 255, 0) 25%),
    radial-gradient(circle at 35% 60%, var(--second-dot), rgba(255, 255, 255, 0) 25%),
    radial-gradient(circle at 85% 25%, var(--third-dot), rgba(255, 255, 255, 0) 25%);
}
</style>
