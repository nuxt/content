import { withBase } from 'ufo'
import { useRuntimeConfig } from '#app'

export const withContentBase = (url: string) => withBase(url, '/api/' + useRuntimeConfig().content.basePath)
