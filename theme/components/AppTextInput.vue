<template>
  <input
    v-bind="computedProps"
    class="dark:bg-gray-900 border-1px border-black dark:border-gray-700 rounded-full py-2 px-3 text-sm text-gray-600 placeholder-gray-200 dark:text-white dark:placeholder-gray-500 hover:border-gray-600 focus:outline-none focus:border-gray-400 focus:hover:border-gray-400"
    @input="updateInput"
  />
</template>

<script setup>
const props = defineProps({
  value: {
    type: String,
    default: null
  },
  id: {
    type: String,
    default: null
  },
  name: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: null
  },
  type: {
    type: String,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const computedProps = computed(() => ({
  value: props.value,
  id: props.id,
  name: props.name,
  type: props.type,
  placeholder: props.placeholder,
  disabled: props.disabled
}))

const emit = defineEmits(['input'])

function updateInput(e) {
  emit('input', e.target.value)
}
</script>
