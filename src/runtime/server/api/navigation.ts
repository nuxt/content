import { IncomingMessage } from 'http'
import { getNavigation } from '../content'

/**
 * Get the navigation object from the database.
 * Also supports getting it by localization.
 */
export default async (req: IncomingMessage) => {
  const url = (req.url || '').split('?')[0].replace(/^\//, '')
  // detect preview mode
  const withPreview = (req.url || '').includes('preview=true')
  const result = await getNavigation(withPreview)

  // Return navigation of a specific language
  if (result[url]) return result[url]

  return result
}
