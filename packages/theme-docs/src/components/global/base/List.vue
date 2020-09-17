<template>
  <div>
    <div v-for="(item, i) in items" :key="i" class="mt-3 flex">
      <component :is="icon" class="h-6 w-6 mt-px mr-3 flex-shrink-0 text-primary-500" />
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
    }
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
