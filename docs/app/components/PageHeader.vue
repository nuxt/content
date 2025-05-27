<script setup lang="ts">
import { kebabCase } from 'scule'
import type { PageCollectionItemBase } from '@nuxt/content'
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  page: PageCollectionItemBase
  headline?: string
}>()

const route = useRoute()

const copyStatus = ref<'idle' | 'copying' | 'copied'>('idle')
const items = ref<DropdownMenuItem[]>([
  {
    label: 'View as Markdown',
    icon: 'i-simple-icons:markdown',
    onSelect() {
      window.open(`${window.location.origin}/raw${route.path}.md`, '_blank')
    },
  },
  // {
  //   label: 'Open in ChatGPT',
  //   icon: 'i-simple-icons:openai',
  //   onSelect() {
  //     window.open(`https://chatgpt.com/?hints=search&q=${encodeURIComponent(`Read from ${window.location.origin}/raw${route.path}.md so I can ask questions about it.`)}`, '_blank')
  //   },
  // },
  {
    label: 'Copy Markdown Link',
    icon: 'i-lucide-link',
    onSelect() {
      navigator.clipboard.writeText(`${window.location.origin}/raw${route.path}.md`)
    },
  },
])
const copyPage = async () => {
  copyStatus.value = 'copying'
  const markdown = await $fetch<string>(`${window.location.origin}/raw${route.path}.md`)
  await navigator.clipboard.writeText(markdown)
  copyStatus.value = 'copied'
  setTimeout(() => {
    copyStatus.value = 'idle'
  }, 2000)
}
</script>

<template>
  <UPageHeader
    :title="page.title"
    :links="page.links"
    :headline="headline"
  >
    <template #headline>
      <div
        v-if="headline"
        class="w-full justify-between flex"
      >
        {{ headline }}
        <UButtonGroup>
          <UButton
            :label="`${copyStatus === 'copied' ? 'Copied' : 'Copy Page'}`"
            :icon="`i-lucide-${copyStatus === 'copied' ? 'check' : 'copy'}`"
            color="neutral"
            variant="outline"
            :loading="copyStatus === 'copying'"
            @click="copyPage"
          />
          <UDropdownMenu
            :items="items"
            :content="{
              align: 'end',
              side: 'bottom',
              sideOffset: 8,
            }"
            :ui="{
              content: 'w-48',
            }"
          >
            <UButton
              icon="i-lucide-chevron-down"
              color="neutral"
              variant="outline"
            />
          </UDropdownMenu>
        </UButtonGroup>
      </div>
    </template>
    <template #description>
      <MDC
        vif="page.description"
        :cache-key="`${kebabCase(route.path)}-description`"
        :value="page.description"
        unwrap="p"
      />
    </template>
  </UPageHeader>
</template>
