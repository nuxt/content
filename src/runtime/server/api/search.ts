import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const { search } = runtimeConfig.public.content

  const isFullTextMode = search?.mode === 'full-text'

  const files = await serverQueryContent(event).find()

  const docs = await Promise.all(
    files
      .filter((file) => {
        // TODO: add configuration for filtering
        return file?._extension === 'md' &&
      file?._draft === false && file?._empty === false
      })
      .map(
        ({ _id: id, _path: path, _dir: dir, title = '', description = '', body = undefined }) => {
          // TODO: add configuration to choose which fields to index
          return {
            id,
            path,
            dir,
            title,
            description,
            keywords: body?.toc?.links.map(link => link?.text),
            body: isFullTextMode ? extractTextFromAst(body, search.noExtractionFromTags ?? []) : ''
          }
        }
      )
  )
  return docs
})

function extractTextFromAst (node: any, tagsToRemove: string[] = []) {
  let text = ''

  // Get text from markdown AST
  if (node.type === 'text') {
    text += node.value
  }

  // Do not explore children
  if (tagsToRemove.includes(node.tag ?? '')) {
    return ''
  }

  // Explore children
  if (node.children) {
    for (const child of node.children) {
      text += ' ' + extractTextFromAst(child, tagsToRemove)
    }
  }
  return text
}
