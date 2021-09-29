import { getContext } from 'unctx'
import type { DocusContext } from 'types'
// TODO: dynamically load server/client context
// @ts-ignore
import context from '#build/docus/context.client.mjs'

/**
const client = typeof window !== 'undefined'

const context = client // @ts-ignore
  ? import('#build/docus/context.client.mjs').then(c => c.default || c) // @ts-ignore
  : import('#build/docus/context.server.mjs').then(c => c.default || c)
 */

const ctx = getContext<DocusContext>('docus_context')

ctx.set(context, true)

export const useDocusContext = ctx.use
