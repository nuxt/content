import { parse } from '@docus/mdc'
import { useDocusContext } from '../../context'
import { getPathMeta } from '../utils'

export default async function transformMarkdown(id: string, input: string) {
  const context = useDocusContext()!
  const result = await parse(input, context.transformers.markdown)

  // calculate meta information based on file path
  const pathMeta = getPathMeta(id, {
    locales: context.locales.codes,
    defaultLocale: context.locales.defaultLocale
  })

  result.meta = {
    ...pathMeta,
    ...result.meta
  }
  return result
}
