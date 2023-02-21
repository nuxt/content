import type { H } from 'mdast-util-to-hast'
import { position } from 'unist-util-position'
import { all } from 'mdast-util-to-hast'
import type { MdastContent } from 'mdast-util-to-hast/lib'
import { wrap } from './utils'

type Node = MdastContent & {
  align?: any
  children: MdastContent[]
}

export default function table (h: H, node: Node) {
  const rows = node.children
  const align = node.align || []

  const result = rows.map((row: any, index: number) => {
    const childres = row.children
    const name = index === 0 ? 'th' : 'td'
    let pos = node.align ? align.length : childres.length
    const out = []

    while (pos--) {
      const cell = childres[pos]
      out[pos] = h(cell, name, { align: align[pos] }, cell ? all(h, cell) : [])
    }

    return h(row, 'tr', wrap(out, true))
  })

  const body =
    result[1] &&
    h(
      {
        start: position(result[1]).start,
        end: position(result[result.length - 1]).end
      } as any,
      'tbody',
      wrap(result.slice(1), true)
    )
  return h(node, 'table', wrap([h(result[0].position, 'thead', wrap([result[0]], true))].concat(body || []), true))
}
