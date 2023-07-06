import { defineEventHandler } from 'h3'
import { serverQueryContent } from '../storage'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const { search } = useRuntimeConfig().public.content
  const isFullTextMode = search?.mode === 'full-text'

  const files = await serverQueryContent(event).find()

  const docs = await Promise.all(
    files
      .filter((file) => {
        return file?._extension === 'md' &&
      file?._draft === false && file?._empty === false
      })
      .map(
        async ({ _id: id, _path: path, _dir: dir, title = '', description = '', body = undefined, ...rest }) => {
          // TODO: add configuration to choose which fields to index
          return {
            id,
            path,
            dir,
            title,
            description,
            keywords: body?.toc?.links.map(link => link?.text),
            body: isFullTextMode ? extractTextFromAst(body) : ''
          }
        }
      )
  )

  return docs
})

function extractTextFromAst (node) {
  let text = ''
  if (node.type === 'text') {
    text += node.value
  }
  if (node.children) {
    for (const child of node.children) {
      text += ' ' + extractTextFromAst(child)
    }
  }
  return text
}
