import { serverQueryContent as _serverQueryContent } from '../server/storage'
import { type serverQueryContent as legacyServerQueryContent } from './types'

export { parseContent } from '../server/storage'

export const serverQueryContent = _serverQueryContent as unknown as typeof legacyServerQueryContent
