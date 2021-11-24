<script lang="ts">
// Ref: https://github.com/docusgen/debug-theme/blob/main/app/components/Debug.vue
import {
  useDocusContent,
  useDocusConfig,
  useDocusNavigation,
  useDocusTheme,
  useDocusLayout,
  useDocusPage,
  useDocusStyles
} from '#docus'
import { defineComponent } from '#app'

export default defineComponent({
  setup() {
    const content = useDocusContent()
    const page = useDocusPage()
    const config = useDocusConfig()
    const navigation = useDocusNavigation()
    const theme = useDocusTheme()
    const layout = useDocusLayout()
    const styles = useDocusStyles()
    const stringify = (value: any): string =>
      JSON.stringify(
        value,
        function (_, val) {
          if (typeof val === 'function') return val + ''
          return val
        },
        4
      )
    const parts: { [key: string]: any } = {
      useDocusPage: page,
      useDocusConfig: config,
      useDocusNavigation: navigation,
      useDocusTheme: theme,
      useDocusLayout: layout,
      useDocusContent: content,
      useDocusStyles: styles
    }
    return { parts, stringify }
  }
})
</script>

<template>
  <div>
    <div v-for="part in Object.keys(parts)" :key="part">
      <h2>⚙️ {{ part }}</h2>
      <pre>{{ stringify(parts[part]) }}</pre>
    </div>
  </div>
</template>
