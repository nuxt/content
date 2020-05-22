<template>
  <div class="w-full lg:w-1/4 py-4 lg:p-8">
    <div class="lg:sticky lg:top-0 lg:pt-24 lg:-mt-24">
      <h3
        class="mb-3 lg:mb-2 text-gray-500 dark:text-gray-600 uppercase tracking-wide font-bold text-sm lg:text-xs"
      >{{ $t('toc.title') }}</h3>
      <nav>
        <scrollactive highlight-first-item active-class="text-green-500" tag="ul">
          <li
            v-for="link of toc"
            :key="link.id"
            class="text-gray-600 dark:text-gray-500"
            :class="{
              'border-t border-dashed dark:border-gray-800 first:border-t-0 font-semibold': link.depth === 2
            }"
          >
            <a
              :href="`#${link.id}`"
              class="block text-sm scrollactive-item transition-transform ease-in-out duration-300 transform hover:translate-x-1"
              :class="{
                'py-2': link.depth === 2,
                'ml-2 pb-2': link.depth === 3
              }"
            >{{ link.text }}</a>
          </li>
        </scrollactive>
      </nav>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    toc: {
      type: Array,
      required: true
    }
  }
}
</script>
