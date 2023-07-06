import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const { search } = runtimeConfig.public.content

  const isFullTextMode = search?.mode === 'full-text'

  const files = await serverQueryContent(event).find()

  const { extensions, draft, empty } = search.filter
  const docs = await Promise.all(
    files
      .filter((file) => {
        const keepExtension = extensions.includes(file?._extension)
        // If empty or draft, we look at the configuration to know if we keep it
        const keepEmpty = file?._empty ? empty : true
        const keepDraft = file?._draft ? draft : true

        return keepExtension && keepEmpty && keepDraft
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
            body: isFullTextMode && body ? extractTextFromAst(body, search.noExtractionFromTags ?? []) : ''
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
