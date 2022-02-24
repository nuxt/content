import { defineHandle, assertMethod, sendError, createError } from 'h3'
import { withoutLeadingSlash } from 'ufo'
import { getContent } from '../storage'

export default defineHandle((req, res) => {
  assertMethod(req, 'GET')

  const id = decodeURIComponent(withoutLeadingSlash(req.url || ''))

  if (!id) {
    return sendError(res, createError({
      statusCode: 400,
      statusMessage: 'Bad Request'
    }))
  }

  return getContent(id)
})
