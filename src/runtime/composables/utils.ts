import { withBase } from 'ufo'
import { useRuntimeConfig } from '#app'
import { unwrap, flatUnwrap } from '../markdown-parser/utils/node'

export const withContentBase = (url: string) => withBase(url, '/api/' + useRuntimeConfig().content.basePath)

export const useUnwrap = () => ({
  unwrap,
  flatUnwrap
})
