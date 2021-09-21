import { IncomingMessage } from 'http'
import { getNavigation } from '../content'
import { useKey, usePreview } from '../utils'

/**
 * Get the navigation object from the database.
 * Also supports getting it by localization.
 */
export default async (req: IncomingMessage) => {
  const key = useKey(req)
  // detect preview mode
  const previewKey = usePreview(req)
  const result = await getNavigation(previewKey)

  // Return navigation of a specific language
  if (result[key]) return result[key]

  return result
}
