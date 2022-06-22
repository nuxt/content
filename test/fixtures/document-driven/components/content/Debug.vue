<template>
  <div>
    <h3 style="margin: 0 !important;">
      useDocumentDriven().navigation
    </h3>
    <pre style="padding: 1rem; border-radius: 16px;">{{ navigation }}</pre>

    <h3 style="margin: 0 !important;">
      useDocumentDriven().page
    </h3>
    <pre style="padding: 1rem; border-radius: 16px;">{{ page }}</pre>

    <h3 style="margin: 0 !important;">
      useDocumentDriven().surround
    </h3>
    <pre style="padding: 1rem; border-radius: 16px;">{{ surround }}</pre>

    <h3 style="margin: 0 !important;">
      useDocumentDriven().globals
    </h3>
    <pre style="padding: 1rem; border-radius: 16px;">{{ globals }}</pre>

    <h3 style="margin: 0 !important;">
      useTheme()
    </h3>
    <pre style="padding: 1rem; border-radius: 16px;">{{ theme }}</pre>
  </div>
</template>

<script setup lang="ts">
import { useDocumentDriven, useTheme } from '#imports'

const { globals, surround, page, navigation } = useDocumentDriven()

const theme = useTheme()
</script>
