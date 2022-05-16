import type { CompatibilityEvent } from 'h3'
import { useQuery, useCookie } from 'h3'

export const isPreview = (event: CompatibilityEvent) => {
  const previewToken = useQuery(event).previewToken || useCookie(event, 'previewToken')
  return !!previewToken
}

export const getPreview = (event) => {
  const key = useQuery(event).previewToken as string || useCookie(event, 'previewToken')

  return { key }
}
