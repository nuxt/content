<template>
  <button
    class="w-10 rounded-md hover:text-green-500 focus:outline-none transition ease-in-out duration-150 focus:outline-none"
    aria-label="Color Mode"
    @click="$colorMode.value === 'dark' ? $colorMode.preference = 'light' : $colorMode.preference = 'dark'"
  >
    <IconSun v-if="$colorMode.value === 'light'" class="w-6 h-6" />
    <IconMoon v-else class="w-6 h-6" />
  </button>
</template>
