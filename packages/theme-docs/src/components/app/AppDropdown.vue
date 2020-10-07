<template>
  <div
    v-click-away="'close'"
    class="relative inline-block text-left"
    @mouseenter="open = true"
    @mouseleave="open = false"
    @keydown.escape="open = false"
  >
    <slot name="trigger" :toggle="toggle" :open="open" />

    <transition
      enter-class="transform opacity-0 scale-95"
      enter-active-class="transition ease-out duration-100"
      enter-to-class="transform opacity-100 scale-100"
      leave-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-show="open"
        class="mt-2 w-auto rounded-md shadow-lg z-50 origin-top-right absolute bottom-0 right-0"
      >
        <div class="rounded-md bg-white dark:bg-gray-800 shadow-xs">
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import ClickAway from '~/directives/click-away'

export default {
  name: 'Dropdown',
  directives: {
    'click-away': ClickAway
  },
  data () {
    return {
      open: false
    }
  },
  methods: {
    toggle () {
      this.open = !this.open
    },
    close () {
      this.open = false
    }
  }
}
</script>
