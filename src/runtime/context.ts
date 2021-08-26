import { DocusContext } from '../types'
import { processContext } from './transformers/markdown/utils'
// @ts-ignore
import config from '#config'

const ctx = config.docusContext as DocusContext

processContext(ctx)

export const docusContext = ctx
export const useDocusContext = () => ctx
