import { useQuery, useCookie, deleteCookie } from 'h3'
import { parse, transform } from './transformers'
import { cacheStorage, draftStorage, previewStorage } from './storage'
const publicConfig = useRuntimeConfig().public

export const togglePreviewMode = async (event) => {
  const previewToken = useQuery(event).previewToken || useCookie(event, 'previewToken')
  if (publicConfig.admin?.apiURL && previewToken) {
    const draft = await $fetch(`/api/projects/preview?token=${previewToken}`, { baseURL: publicConfig.admin?.apiURL }).catch(_err => null)
    // If invalid token
    if (!draft) {
      // Clear cookie
      deleteCookie(event, 'previewToken', null)
      await cacheStorage.setItem('isPreview', false)
    } else {
      const previewMtime = await cacheStorage.getItem('isPreview')
      if (previewMtime !== draft.mtime) {
        await cacheStorage.setItem('isPreview', draft.mtime)
        await draftStorage.clear()
        for (const addition of draft.additions) {
          const { path, oldPath, content } = addition

          if (oldPath) {
            previewStorage.removeItem(oldPath)
          }

          const id = path.replace(/\//g, ':')
          const parsed = await parse(id, content).then(transform)
          previewStorage.setItem(id, { parsed })
        }
        for (const deletion of draft.deletions) {
          previewStorage.removeItem(deletion.path)
        }
      }
    }
  } else {
    await cacheStorage.setItem('isPreview', false)
  }
}
