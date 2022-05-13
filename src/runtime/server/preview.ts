import type { CompatibilityEvent } from 'h3'
import { useQuery, useCookie } from 'h3'
import { defineDriver } from 'unstorage'
const publicConfig = useRuntimeConfig().public

export const isPreview = (event: CompatibilityEvent) => {
  const previewToken = useQuery(event).previewToken || useCookie(event, 'previewToken')
  return !!previewToken
}

export const getPreview = (event) => {
  const key = useQuery(event).previewToken as string || useCookie(event, 'previewToken')

  return { key }
}

const adminDriver = defineDriver((options) => {
  const { baseURL } = options

  let memory = {}
  let preview = null

  return {
    async getKeys (prefix: string) {
      if (!prefix) {
        return []
      }

      const [previewToken] = prefix.split(':')
      const draft = await $fetch(`/api/projects/preview?token=${previewToken}`, { baseURL }).catch(_err => null)
      if (!draft) {
        return []
      }
      if (preview?.mtime !== draft.mtime) {
        memory = {}
        preview = draft
        for (const addition of draft.additions) {
          const { path, oldPath, content } = addition
          const id = path.replace(/\//g, ':')

          // Mark old path as deleted
          if (oldPath) {
            memory[`${previewToken}:${id}`] = { __deleted: true }
          }

          memory[`${previewToken}:${id}`] = content
          memory[`${previewToken}:${id}$`] = { mtime: new Date(draft.mtime).toISOString() }
        }
        for (const deletion of draft.deletions) {
          memory[`${previewToken}:${deletion.pathid}`] = { __deleted: true }
        }
      }
      return Object.keys(memory).filter(key => !key.endsWith('$'))
    },
    getItem (key: string) {
      return Promise.resolve(memory[key])
    },
    getMeta (key: string) {
      return Promise.resolve(memory[`${key}$`])
    }
  }
})
// TODO: Move it to admin module
useStorage().mount('content:source:preview', adminDriver({
  baseURL: publicConfig.admin?.apiURL || 'https://dev-api.nuxt.com'
}))
