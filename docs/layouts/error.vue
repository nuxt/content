<template>
  <div class="flex flex-wrap-reverse">
    <div class="w-full lg:w-3/4 py-4 lg:pt-8 lg:pb-4 dark:border-gray-800 lg:border-l lg:border-r">
      <article class="lg:px-8">
        <h1 class="text-4xl font-black mb-4 leading-none">{{ error.message }}</h1>
      </article>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      required: true
    }
  },
  head () {
    return {
      title: this.error.message
    }
  }
}
</script>
