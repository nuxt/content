import { fromByteArray } from 'base64-js'
import { withBase } from 'ufo'
import { unwrap, flatUnwrap } from '../markdown-parser/utils/node'
import { useRuntimeConfig } from '#app'

const toByteArray = (s: string) => new Uint8Array(s.length).map((_, i) => s[i].charCodeAt(0))

export const withContentBase = (url: string) => withBase(url, '/api/' + useRuntimeConfig().public.content.base)

export const contentApiWithParams = (url: string, params: any) => {
  let _hash = ''
  if (params) {
    params = JSON.stringify(params)
    // Encode JSON data
    _hash = fromByteArray(toByteArray(params))
      // Replace special characters to prevent creating malformed URL
      .replace(/\+/g, '.').replace(/\//g, '-')
  }

  return withContentBase(`${url}/${(_hash)}${process.dev ? '' : '.json'}`)
}

export const useUnwrap = () => ({
  unwrap,
  flatUnwrap
})
