import { getContext } from 'unctx'
import type { DocusContext } from 'types'
// @ts-ignore
import context from '#build/docus/context.mjs'

const ctx = getContext<DocusContext>('docus_context')

ctx.set(context, true)

export const useDocusContext = ctx.use
