import { withBase } from 'ufo'
import { useRuntimeConfig } from '#app'
import { unwrap, flatUnwrap } from '../markdown-parser/utils/node'
import { encodeApiParams } from '../utils'

export const withContentBase = (url: string) => withBase(url, '/api/' + useRuntimeConfig().public.content.base)

export const contentApiWithParams = (url: string, params: any) => {
  return withContentBase(`${url}/${encodeApiParams(params)}`)
}

export const useUnwrap = () => ({
  unwrap,
  flatUnwrap
})
