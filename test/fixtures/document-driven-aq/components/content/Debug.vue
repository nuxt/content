<template>
  <div>
    <h3 style="margin: 0 !important;">
      useContent().navigation
    </h3>
    <pre style="padding: 1rem; border-radius: 16px;">{{ navigation }}</pre>

    <h3 style="margin: 0 !important;">
      useContent().page
    </h3>
    <pre style="padding: 1rem; border-radius: 16px;">{{ page }}</pre>

    <h3 style="margin: 0 !important;">
      useContent().surround
    </h3>
    <pre style="padding: 1rem; border-radius: 16px;">{{ surround }}</pre>

    <h3 style="margin: 0 !important;">
      useContent().globals
    </h3>
    <pre style="padding: 1rem; border-radius: 16px;">{{ globals }}</pre>

    <h3 style="margin: 0 !important;">
      useTheme()
    </h3>
    <pre style="padding: 1rem; border-radius: 16px;">{{ theme }}</pre>
  </div>
</template>

<script setup lang="ts">
import { useContent, useTheme } from '#imports'

const { globals, surround, page, navigation } = useContent()

const theme = useTheme()
</script>
