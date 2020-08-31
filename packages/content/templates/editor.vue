<template>
  <textarea
    ref="textarea"
    v-model="file"
    @keyup.stop="onType"
    @keydown.tab.exact.prevent="onTabRight"
    @keydown.tab.shift.prevent="onTabLeft"
    @blur="$emit('endEdit')"
  />
</template>

<script>
export default {
  props: {
    value: String,
    isEditing: Boolean
  },
  data () {
    return {
      file: ''
    }
  },
  watch: {
    value () {
      this.file = this.value
    },
    isEditing () {
      this.onType()
      this.$refs.textarea.focus()
    },
    file () {
      this.$emit('input', this.file)
    }
  },
  methods: {
    onType () {
      const el = this.$refs.textarea
      el.style.height = el.scrollHeight + 'px'
    },
    onTabRight (event) {
      const text = this.file
      const originalSelectionStart = event.target.selectionStart
      const textStart = text.slice(0, originalSelectionStart)
      const textEnd = text.slice(originalSelectionStart)
      this.file = `${textStart}\t${textEnd}`
      event.target.value = this.file // required to make the cursor stay in place.
      event.target.selectionEnd = event.target.selectionStart =
        originalSelectionStart + 1
    },
    onTabLeft (event) {
      const text = this.file
      const originalSelectionStart = event.target.selectionStart
      const textStart = text.slice(0, originalSelectionStart)
      const textEnd = text.slice(originalSelectionStart)
      this.file = `${textStart.replace(/\t$/, '')}${textEnd}`
      event.target.value = this.file // required to make the cursor stay in place.
      event.target.selectionEnd = event.target.selectionStart =
        originalSelectionStart - 1
    }
  }
}
</script>
