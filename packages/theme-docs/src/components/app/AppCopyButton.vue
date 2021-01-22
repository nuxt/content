<template>
  <button ref="copy" class="copy">
    <IconClipboardCheck v-if="state === 'copied'" class="w-5 h-5" />
    <IconClipboardCopy v-else class="w-5 h-5" />
  </button>
</template>

<script>
import Clipboard from 'clipboard'

export default {
  data () {
    return {
      state: 'init'
    }
  },
  mounted () {
    const copyCode = new Clipboard(this.$refs.copy, {
      target (trigger) {
        return trigger.previousElementSibling
      }
    })

    copyCode.on('success', (event) => {
      event.clearSelection()
      this.state = 'copied'
      window.setTimeout(() => {
        this.state = 'init'
      }, 2000)
    })
  }
}
</script>
