import { getContext } from 'unctx'
import { DocusContext } from '../types'
const client = typeof window !== 'undefined'

const context = client // @ts-ignore
  ? import('#build/docus/context.client.mjs').then(c => c.default || c) // @ts-ignore
  : import('#build/docus/context.server.mjs').then(c => c.default || c)

const ctx = getContext<DocusContext>('docus_context')

context.then(c => ctx.set(c, true))

export const useDocusContext = ctx.use
