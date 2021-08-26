import { IncomingMessage } from 'http'
import { getNavigation } from '../content'

export default async (req: IncomingMessage) => {
  const url = req.url!.replace(/^\//, '')
  const result = await getNavigation()

  // return navigation of specific language
  if (result[url]) return result[url]

  return result
}
