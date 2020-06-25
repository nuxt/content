<template>
  <div class="nuxt-content-container">
    <textarea
      v-show="isEditing"
      v-model="file"
      ref="textarea"
      @keyup.stop="onType"
      @blur="toggleEdit"
    />
    <nuxt-content-dev
      ref="content"
      :class="staticClass"
      v-show="!isEditing"
      :document="document"
      @dblclick="toggleEdit"
    />
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
      staticClass: [],
      isEditing: false,
      file: null
    }
  },
  mounted () {
    if (this.$vnode.data.class) {
      this.staticClass = this.staticClass.concat(this.$vnode.data.class)
      delete this.$vnode.data.class
    }

    if (this.$vnode.data.staticClass) {
      this.staticClass = this.staticClass.concat(this.$vnode.data.staticClass)
      delete this.$vnode.data.staticClass
    }
  },
  computed: {
    fileUrl () {
      return `/<%= options.apiPrefix %>${this.document.path}${this.document.extension}`
    }
  },
  methods: {
    async toggleEdit () {
      if (this.isEditing) {
        await this.saveFile()
        this.isEditing = false
        return
      }
      // Start editing mode
      const contentHeight = this.$refs.content.offsetHeight
      const actualScrollY = window.scrollY
      // Fetch file content
      await this.fetchFile()
      this.isEditing = true
      this.$refs.textarea.style.minHeight = `${contentHeight}px`
      await this.waitFor(10)
      this.$refs.textarea.focus()
      this.onType()
      await this.waitFor(10)
      window.scrollTo(window.scrollX, actualScrollY)
    },
    async fetchFile () {
      this.file = await fetch(this.fileUrl).then(res => res.text())
    },
    async saveFile () {
      await fetch(this.fileUrl, { method: 'PUT', body: JSON.stringify({ file: this.file }) }).then(res => res.json())
    },
    waitFor (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    onType () {
      const el = this.$refs.textarea

      el.style.height = el.scrollHeight + 'px';
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
  padding: 8px;
}
</style>
