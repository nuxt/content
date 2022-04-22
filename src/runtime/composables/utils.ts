import { fromByteArray } from 'base64-js'
import { withBase } from 'ufo'
import { unwrap, flatUnwrap } from '../markdown-parser/utils/node'
import { useRuntimeConfig } from '#app'

const toByteArray = (s: string) => new Uint8Array(s.length).map((_, i) => s[i].charCodeAt(0))
const encodeParams = (params: any = {}) => {
  return fromByteArray(toByteArray(encodeURIComponent(JSON.stringify(params)))) // encode URI component to prevent malformed Characters in JSON
    .replace(/\+/g, '.').replace(/\//g, '-') // Replace special characters to prevent creating malformed URL
}

export const withContentBase = (url: string) => withBase(url, '/api/' + useRuntimeConfig().public.content.base)

export const contentApiWithParams = (url: string, params: any) => {
  return withContentBase(`${url}/${encodeParams(params)}`)
}

export const useUnwrap = () => ({
  unwrap,
  flatUnwrap
})
