import { fileURLToPath } from 'url'
import { setup, $fetch } from '@nuxt/test-utils'
import { beforeAll, benchmark, describe } from './utils.js'

const randomMember = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

describe('Api', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../fixtures/basic', import.meta.url)),
    server: true
  })

  let contents: string[] = []
  beforeAll(async () => {
    await $fetch('/api/generate', {
      params: {
        count: 100
      }
    })

    contents = await $fetch('/api/_content/list')

    // eslint-disable-next-line no-console
    console.log(`Generated ${contents.length} docs`)
  })

  benchmark('List Contents', async () => await $fetch('/api/_content/list'))

  benchmark('Get Single Content', async () => await $fetch(`/api/_content/get/${randomMember(contents)}`))
})
