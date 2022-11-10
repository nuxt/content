import type { H3Event } from 'h3'
import { getQuery, getCookie } from 'h3'

export const isPreview = (event: H3Event) => {
  const previewToken = getQuery(event).previewToken || getCookie(event, 'previewToken')
  return !!previewToken
}

export const getPreview = (event: H3Event) => {
  const key = getQuery(event).previewToken as string || getCookie(event, 'previewToken')

  return { key }
}
