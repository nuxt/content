import { useCookie, useRoute } from '#imports'

let showWarning = true

export const useContentPreview = () => {
  const getPreviewToken = () => {
    return useCookie('previewToken').value ||
    (import.meta.client && sessionStorage.getItem('previewToken')) ||
    undefined
  }

  const setPreviewToken = (token: string | undefined) => {
    useCookie('previewToken').value = token

    useRoute().query.preview = token || ''

    if (import.meta.client) {
      if (token) {
        sessionStorage.setItem('previewToken', token)
      } else {
        sessionStorage.removeItem('previewToken')
      }

      window.location.reload()
    }
  }

  const isEnabled = () => {
    const query = useRoute().query
    // Disable clientDB when `?preview` is set in query, and it has falsy value
    if (Object.prototype.hasOwnProperty.call(query, 'preview') && !query.preview) {
      return false
    }

    // Enable clientDB when preview mode is enabled
    if (query.preview || useCookie('previewToken').value) {
      if (import.meta.dev && showWarning) {
         
        console.warn('[content] Client DB enabled since a preview token is set (either in query or cookie).')
        showWarning = false
      }
      return true
    }

    if (import.meta.client && sessionStorage.getItem('previewToken')) {
      return true
    }

    return false
  }

  return {
    isEnabled,
    getPreviewToken,
    setPreviewToken
  }
}
