import { visit, decompressTree } from '@nuxt/content/runtime'

export default defineNitroPlugin((nitroApp) => {
  // @ts-expect-error -- TODO: fix types
  nitroApp.hooks.hook('content:llms:generate:document', async (doc) => {
    visit(doc.body, node => node[0] === 'note', (node) => {
      const _tree = decompressTree({ type: 'minimal', value: [node] })
      return ['pre', { language: 'json', filename: 'note.json', code: JSON.stringify(node, null, 2) }]
    })
  })
})
