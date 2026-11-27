import { defineEventHandler, readBody, setResponseStatus } from 'nuxt/server'
import { content } from '../content'
import { heads } from '../forge'

// Move the head of `repo` and revalidate, as a push webhook does.
export default defineEventHandler(async (event) => {
  const { repo, head, revalidate = true } = await readBody<{ repo: string, head: string, revalidate?: boolean }>(event)
  heads[repo] = head
  if (!revalidate) return {}
  try {
    return await revalidateContent(content)
  }
  catch (error) {
    setResponseStatus(event, 500)
    return { error: (error as Error).message }
  }
})
