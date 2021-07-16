import type { H } from 'mdast-util-to-hast'
import { position } from 'unist-util-position'
import { wrap } from 'mdast-util-to-hast/lib/wrap'
import { all } from 'mdast-util-to-hast/lib/traverse'

export default function table(h: H, node: any) {
  const rows = node.children
  const align = node.align || []

  const result = rows.map((row: any, index: number) => {
    const childres = row.children
    const name = index === 0 ? 'prose-th' : 'prose-td'
    let pos = node.align ? align.length : childres.length
    const out = []

    while (pos--) {
      const cell = childres[pos]
      out[pos] = h(cell, name, { align: align[pos] }, cell ? all(h, cell) : [])
    }

    return h(row, 'prose-tr', wrap(out, true))
  })

  const body =
    result[1] &&
    h(
      {
        start: position(result[1]).start,
        end: position(result[result.length - 1]).end
      },
      'prose-tbody',
      wrap(result.slice(1), true)
    )
  return h(
    node,
    'prose-table',
    wrap([h(result[0].position, 'prose-thead', wrap([result[0]], true))].concat(body || []), true)
  )
}
