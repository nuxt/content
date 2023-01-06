import type { H } from 'mdast-util-to-hast'
import { detab } from 'detab'
import { u } from 'unist-builder'
import { parseThematicBlock } from './utils'

export default (h: H, node: any) => {
  const lang = (node.lang || '') + ' ' + (node.meta || '')
  const { language, highlights, filename } = parseThematicBlock(lang)
  const code = node.value ? detab(node.value + '\n') : ''

  return h(
    node.position,
    'code',
    {
      language,
      filename,
      highlights,
      meta: node.meta,
      code
    },
    [h(node, 'pre', {}, [h(node, 'code', { __ignoreMap: '' }, [u('text', code)])])]
  )
}
