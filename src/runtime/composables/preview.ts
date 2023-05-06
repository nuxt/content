import { useCookie, useRoute } from '#imports'

let showWarning = true

export const useContentPreview = () => {
  const getPreviewToken = () => {
    return useCookie('previewToken').value ||
    (process.client && sessionStorage.getItem('previewToken')) ||
    undefined
  }

  const setPreviewToken = (token: string | undefined) => {
    useCookie('previewToken').value = token

    useRoute().query.preview = token || ''

    if (process.client) {
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
      if (process.dev && showWarning) {
        // eslint-disable-next-line no-console
        console.warn('[content] Client DB enabled since a preview token is set (either in query or cookie).')
        showWarning = false
      }
      return true
    }

    if (process.client && sessionStorage.getItem('previewToken')) {
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
