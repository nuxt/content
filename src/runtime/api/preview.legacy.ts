import { eventHandler } from 'h3'
import { useRuntimeConfig, useAppConfig } from 'nitropack/runtime'
import { createPreviewPayload } from '../internal/preview-payload'

export default eventHandler(async () => {
  return createPreviewPayload(useAppConfig(), useRuntimeConfig())
})
