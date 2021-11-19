import { getContext } from 'unctx'
import type { DocusConfig } from 'types'
// @ts-ignore
import options from '#build/docus/options.mjs'

const ctx = getContext<DocusConfig>('docus_context')

ctx.set(options, true)

export const useDocusContext = ctx.use
