import type { Nuxt } from '@nuxt/schema'
import { assert, expect, test, describe } from 'vitest'
import { useContentMounts } from '../../src/utils'

const nuxtDummy = { options: { rootDir: '/test', srcDir: '/test' } } as Nuxt

describe('Content sources', () => {
  test('Relative path', () => {
    const mounts = useContentMounts(nuxtDummy, ['content'])
    const mount = mounts['content:source:content']

    assert(typeof mount === 'object')
    assert(mount.driver === 'fs')
    assert(mount.driverOptions?.base === '/test/content')
  })

  test('Absolute path', () => {
    const mounts = useContentMounts(nuxtDummy, ['/content'])
    const mount = mounts['content:source:_content']

    assert(typeof mount === 'object')
    assert(mount.driver === 'fs')
    assert(mount.driverOptions?.base === '/content')
  })

  test('Custom driver', () => {
    const mounts = useContentMounts(nuxtDummy, [
      {
        name: 'repo1',
        driver: 'http',
        driverOptions: {
          base: 'https://cdn.com'
        }
      }
    ])

    assert(Object.keys(mounts).length === 1)

    expect(mounts).toMatchObject({
      'content:source:repo1': { driver: 'http', driverOptions: { base: 'https://cdn.com' } }
    })
  })

  test('Multiple storages', () => {
    const mounts = useContentMounts(nuxtDummy, [
      'content',
      '/repo1/docs',
      'repo2/docs',
      {
        name: 'repo1',
        driver: 'http',
        driverOptions: {
          base: 'https://cdn.com'
        }
      }
    ])

    assert(Object.keys(mounts).length === 4)

    expect(mounts).toMatchObject({
      'content:source:content': { driver: 'fs', driverOptions: { base: '/test/content' } },
      'content:source:_repo1_docs': { driver: 'fs', driverOptions: { base: '/repo1/docs' } },
      'content:source:repo2_docs': { driver: 'fs', driverOptions: { base: '/test/repo2/docs' } },
      'content:source:repo1': { driver: 'http', driverOptions: { base: 'https://cdn.com' } }
    })
  })
})
