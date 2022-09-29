import type { CompatibilityEvent } from 'h3'
import { getQuery, getCookie } from 'h3'

export const isPreview = (event: CompatibilityEvent) => {
  const previewToken = getQuery(event).previewToken || getCookie(event, 'previewToken')
  return !!previewToken
}

export const getPreview = (event: CompatibilityEvent) => {
  const key = getQuery(event).previewToken as string || getCookie(event, 'previewToken')

  return { key }
}
