import type { Nuxt } from '@nuxt/schema'
import { assert, expect, test, describe } from 'vitest'
import { useContentMounts } from '../src/utils'

const nuxtDummy = { options: { rootDir: '/test', srcDir: '/test' } } as Nuxt

describe('module', () => {
  test('[sources] [array] Relative path', () => {
    const mounts = useContentMounts(nuxtDummy, ['content'])
    const mount = mounts['content:source:content']

    assert(typeof mount === 'object')
    assert(mount.driver === 'fs')
    assert(mount.base === '/test/content')
  })

  test('[sources] [array] Absolute path', () => {
    const mounts = useContentMounts(nuxtDummy, ['/content'])
    const mount = mounts['content:source:_content']

    assert(typeof mount === 'object')
    assert(mount.driver === 'fs')
    assert(mount.base === '/content')
  })

  test('[sources] [array] Custom driver', () => {
    const mounts = useContentMounts(nuxtDummy, [
      {
        name: 'repo1',
        driver: 'http',
        base: 'https://cdn.com'
      }
    ])

    expect(mounts).toMatchObject({
      'content:source:repo1': { driver: 'http', base: 'https://cdn.com' }
    })
  })

  test('[sources] [array] Multiple storages', () => {
    const mounts = useContentMounts(nuxtDummy, [
      'content',
      '/repo1/docs',
      'repo2/docs',
      {
        name: 'repo1',
        driver: 'http',
        base: 'https://cdn.com'
      }
    ])

    assert(Object.keys(mounts).length === 4)

    expect(mounts).toMatchObject({
      'content:source:content': { driver: 'fs', base: '/test/content' },
      'content:source:_repo1_docs': { driver: 'fs', base: '/repo1/docs' },
      'content:source:repo2_docs': { driver: 'fs', base: '/test/repo2/docs' },
      'content:source:repo1': { driver: 'http', base: 'https://cdn.com' }
    })
  })
  test('[sources] [array] overwrite default source', () => {
    const mounts = useContentMounts(nuxtDummy, [
      {
        name: 'content',
        driver: 'http',
        base: 'https://cdn.com'
      }
    ])

    assert(Object.keys(mounts).length === 1)

    expect(mounts).toMatchObject({
      'content:source:content': { driver: 'http', base: 'https://cdn.com' }
    })
  })

  test('[sources] [object] overwrite default source', () => {
    const mounts = useContentMounts(nuxtDummy, {
      content: {
        driver: 'http',
        base: 'https://cdn.com'
      }
    })

    expect(mounts).toMatchObject({
      'content:source:content': { driver: 'http', base: 'https://cdn.com' }
    })
  })

  test('[sources] [object] secondary source', () => {
    const mounts = useContentMounts(nuxtDummy, {
      secondary: {
        driver: 'http',
        base: 'https://cdn.com'
      }
    })

    expect(mounts).toMatchObject({
      'content:source:secondary': { driver: 'http', base: 'https://cdn.com' }
    })
  })
})
