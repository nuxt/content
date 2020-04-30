<template>
  <div class="code-group">
    <button v-for="{ label } in tabs" :key="label" @click="currentTab = label">{{ label }}</button>
    <slot />
  </div>
</template>

<script>
export default {
  data () {
    return {
      tabs: [],
      currentTab: ''
    }
  },
  watch: {
    currentTab (newValue, oldValue) {
      this.switchTab(newValue)
    }
  },
  created () {
    this.$slots.default.map((slot) => {
      this.tabs.push({
        label: slot.componentOptions.propsData.label,
        elm: null
      })
    })
    // this.currentTab = this.tabs[0].label
  },
  mounted () {
    this.tabs = this.$slots.default.map((slot) => {
      return {
        label: slot.componentOptions.propsData.label,
        elm: slot.elm
      }
    })
    this.$slots.default[0].elm.classList.add('active')
  },
  methods: {
    switchTab (label) {
      this.tabs.map((tab) => {
        tab.elm.classList.remove('active')
      })
      this.tabs.find(tab => tab.label === label).elm.classList.add('active')
    }
  }
}
</script>

<style>
button {
  padding: 0.5rem;
}
</style>
