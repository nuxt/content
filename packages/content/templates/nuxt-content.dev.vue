<template>
  <div :class="['nuxt-content-container', { 'is-editing': isEditing }]">
    <client-only>
      <editor
        v-show="isEditing"
        v-model="file"
        :is-editing="isEditing"
        class="nuxt-content-editor"
        @endEdit="toggleEdit"
      />
    </client-only>
    <nuxt-content-dev
      v-show="!isEditing"
      :id="id"
      ref="content"
      :class="classes"
      :document="document"
      @dblclick="toggleEdit"
    />
  </div>
</template>

<script>
import NuxtContent from './nuxt-content'
import Editor from '<%= options.editor %>'

export default {
  name: 'NuxtContent',
  components: {
    NuxtContentDev: NuxtContent,
    Editor
  },
  props: NuxtContent.props,
  data () {
    return {
      classes: [],
      isEditing: false,
      file: null,
      id: null
    }
  },
  computed: {
    fileUrl () {
      return `/<%= options.apiPrefix %>${this.document.path}${this.document.extension}`
    }
  },
  mounted () {
    if (this.$vnode.data.attrs && this.$vnode.data.attrs.id) {
      this.id = this.$vnode.data.attrs.id
    }
    if (this.$vnode.data.class) {
      let classes
      if (Array.isArray(this.$vnode.data.class)) {
        classes = this.$vnode.data.class
      } else if (typeof this.$vnode.data.class === 'object') {
        const keys = Object.keys(this.$vnode.data.class)
        classes = keys.filter(key => this.$vnode.data.class[key])
      } else {
        classes = this.$vnode.data.class
      }
      this.classes = this.classes.concat(classes)
      delete this.$vnode.data.class
    }

    if (this.$vnode.data.staticClass) {
      this.classes = this.classes.concat(this.$vnode.data.staticClass)
      delete this.$vnode.data.staticClass
    }
  },
  methods: {
    async toggleEdit () {
      if (this.isEditing) {
        await this.saveFile()
        this.isEditing = false
        return
      }
      // Fetch file content
      await this.fetchFile()
      // Start editing mode
      this.isEditing = true
    },
    async fetchFile () {
      this.file = await fetch(this.fileUrl).then(res => res.text())
    },
    async saveFile () {
      await fetch(this.fileUrl, { method: 'PUT', body: JSON.stringify({ file: this.file }) }).then(res => res.json())
    },
    waitFor (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  }
}
</script>

<style scoped>
.nuxt-content-container {
  position: relative;
}

.nuxt-content-editor {
  width: 100%;
  padding: 8px;
}
</style>
