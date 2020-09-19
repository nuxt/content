<template>
  <div>
    <div v-for="(item, i) in items" :key="i" class="mt-3 flex">
      <span :class="`list-${type}`" class="mt-px mr-3 flex-shrink-0">
        <component :is="icon" class="h-6 w-6" />
      </span>
      {{ item }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'success',
      validator (value) {
        return ['info', 'success', 'warning', 'danger'].includes(value)
      }
    }
  },
  computed: {
    icon () {
      return ({
        info: 'IconInformationCircle',
        success: 'IconBadgeCheck',
        warning: 'IconExclamationCircle',
        danger: 'IconXCircle'
      })[this.type]
    }
  }
}
</script>

<style>

/* Info */
.list-info {
  @apply text-blue-500;
}
/* Success */
.list-success {
  @apply text-green-500;
}
/* Warning */
.list-warning {
  @apply text-orange-500;
}
/* Danger */
.list-danger {
  @apply text-red-500;
}
</style>
