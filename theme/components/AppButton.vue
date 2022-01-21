<template>
  <button
    v-if="!href"
    :class="[baseStyles, sizeStyles, appearanceStyles, appearance, size, bold ? 'font-medium' : 'font-normal']"
  >
    <slot />
  </button>
  <NuxtLink
    v-else-if="isInternal"
    :to="href"
    :class="[baseStyles, sizeStyles, appearanceStyles, appearance, size, bold ? 'font-medium' : 'font-normal']"
  >
    <slot />
  </NuxtLink>
  <a
    v-else
    :href="href"
    v-bind="linkAttrs"
    :class="[baseStyles, sizeStyles, appearanceStyles, appearance, size, bold ? 'font-medium' : 'font-normal']"
  >
    <slot />
  </a>
</template>

<script setup>
const props = defineProps({
  href: {
    type: String,
    default: null
  },
  blank: {
    type: Boolean,
    default: false
  },
  /**
   * `true` if `href` points to a static file
   */
  static: {
    type: Boolean,
    default: false
  },
  appearance: {
    type: String,
    default: 'primary',
    validator(value) {
      return ['ghost', 'primary', 'contrast'].includes(value)
    }
  },
  size: {
    type: String,
    default: 'base',
    validator(value) {
      return ['sm', 'base', 'md', 'lg'].includes(value)
    }
  },
  bold: {
    type: Boolean,
    default: true
  }
})

const baseStyles =
  'relative inline-flex items-center flex-none tracking-wide rounded-full border-2 focus:outline-none select-none'
const sizeStyles = computed(
  () =>
    ({
      sm: 'px-3.5 h-9 text-base',
      base: 'px-4 h-10 text-base',
      md: 'px-4.5 h-11 text-lg',
      lg: 'px-5.5 h-12 text-xl'
    }[props.size])
)
const appearanceStyles = computed(
  () =>
    ({
      ghost:
        'bg-white hover:bg-warmgray-200 text-warmgray-600 hover:bg-opacity-75 border-transparent dark:bg-gray-800 dark:hover:bg-white dark:hover:text-gray-900 dark:border-gray-700 dark:hover:border-white',
      primary:
        'bg-primary-100 text-primary-800 border-primary-100 hover:bg-primary-200 hover:border-primary-200 active:border-primary-800 focus:border-primary-400 dark:bg-primary-500 dark:hover:bg-white dark:text-white dark:hover:text-gray-900 dark:border-primary-500 dark:hover:border-white',
      contrast:
        'bg-gray-900 hover:bg-white dark:bg-white dark:hover:bg-gray-800 text-white hover:text-gray-900 dark:text-gray-900 dark:hover:text-white border-gray-900 hover:border-gray-100 dark:border-white dark:hover:border-gray-700'
    }[props.appearance])
)

const isInternal = computed(() => !props.static && props.href.startsWith('/') && props.href.startsWith('//') === false)

const linkAttrs = computed(() => ({
  rel: isInternal.value ? undefined : 'noopener nofollow noreferrer',
  target: props.blank ? '_blank' : undefined
}))
</script>
