import type { CompatibilityEvent } from 'h3'
import { toByteArray } from 'base64-js'

export const contentApiParams = <T>(event: CompatibilityEvent): T => {
  let { params = '' } = event.context.params || {}

  // Remove possible extension
  params = params.endsWith('.json') ? params.slice(0, -5) : params

  // Fix Base64 format
  params = params.replace(/\./g, '+').replace(/-/g, '/')

  // Decode data
  params = String.fromCharCode(...toByteArray(params))

  return params ? JSON.parse(decodeURIComponent(params)) : {}
}
