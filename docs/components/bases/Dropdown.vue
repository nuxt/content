<template>
  <div
    v-click-away="'close'"
    class="relative"
    @mouseenter="open = true"
    @mouseleave="open = false"
    @keydown.escape="open = false"
  >
    <slot name="trigger" :toggle="toggle" :open="open" />

    <transition name="dropdown">
      <div v-if="open" class="dropdown-wrapper absolute z-50">
        <div class="rounded-md shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import ClickAway from '../directives/click-away'

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

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transform: translateY(0) translateX(-50%) !important;
  transition: opacity 150ms linear, transform 150ms cubic-bezier(0.4, 0, 0.6, 1);
}
.dropdown-enter,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(5px) translateX(-50%) !important;
}
.dropdown-wrapper {
  top: -100%;
  left: 50%;
  transform: translateY(0) translateX(-50%);
}
</style>
