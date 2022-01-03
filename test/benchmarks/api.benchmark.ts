import { setupTest } from '../setup.js'
import { afterAll, beforeAll, benchmark, describe } from './utils.js'

const randomMember = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

describe('api test', () => {
  const ctx = setupTest({
    fixture: 'basic',
    server: true
  })

  let contents: string[] = []
  beforeAll(async () => {
    await ctx._init?.()
    await ctx.fetch('/api/generate', {
      params: {
        count: 100
      }
    })
    contents = await ctx.fetch('/api/_docus/list')
    console.log(`Generated ${contents.length} docs`)
  })

  afterAll(() => ctx._destroy?.())

  benchmark('List Contents', async () => await ctx.fetch('/api/_docus/list'))

  benchmark('Get Single Content', async () => await ctx.fetch(`/api/_docus/get/${randomMember(contents)}`))
})
