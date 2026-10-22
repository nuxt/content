import { defineEventHandler, useAppConfig, useRuntimeConfig } from 'nuxt/server'
import { createPreviewPayload } from '../internal/preview-payload'

export default defineEventHandler(async () => {
  return createPreviewPayload(useAppConfig(), useRuntimeConfig())
})
