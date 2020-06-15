<template>
  <div class="nuxt-content-container">
    <textarea
      v-show="isEditing"
      v-model="file"
      ref="textarea"
      @keydown="onType"
      @keyup.esc="toggleEdit"
      @blur="toggleEdit"
    />
    <nuxt-content-dev v-show="!isEditing" :document="document" @dblclick="toggleEdit" />
  </div>
</template>

<script>
import NuxtContent from './nuxt-content'

export default {
  name: 'NuxtContent',
  components: {
    NuxtContentDev: NuxtContent
  },
  props: NuxtContent.props,
  data () {
    return {
      isEditing: false,
      file: null
    }
  },
  computed: {
    fileUrl () {
      return `/<%= options.apiPrefix %>${this.document.path}${this.document.extension}`
    }
  },
  methods: {
    async toggleEdit () {
      this.isEditing = !this.isEditing

      if (this.isEditing) {
        await this.fetchFile()

        const actualScrollY = window.scrollY
        setTimeout(() => {
          this.$refs.textarea.focus()
          this.onType()
          window.scrollTo(window.scrollX, actualScrollY)
        }, 100)
      } else {
        await this.saveFile()
      }
    },
    async fetchFile () {
      this.file = await fetch(this.fileUrl).then(res => res.text())
    },
    async saveFile () {
      await fetch(this.fileUrl, { method: 'PUT', body: JSON.stringify({ file: this.file }) }).then(res => res.json())
    },
    onType () {
      const el = this.$refs.textarea

      if (el) {
        el.style.height = el.scrollHeight + 'px';
      }
    }
  }
}
</script>

<style scoped>
.nuxt-content-container {
  position: relative;
}
.nuxt-content-container textarea {
  width: 100%;
}
</style>