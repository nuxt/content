const { StatusCodeError } = require('request-promise-native/errors')
const { setup, loadConfig, get } = require('@nuxtjs/module-test-utils')

describe('module', () => {
  let nuxt

  beforeAll(async () => {
    ({ nuxt } = (await setup(loadConfig(__dirname))))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('GET /_content', async () => {
    const items = await get('/_content', { json: true })

    expect(items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        title: 'Home',
        dir: '/',
        path: '/home',
        slug: 'home',
        extension: '.md'
      }),
      expect.objectContaining({
        title: 'About',
        dir: '/',
        path: '/about',
        slug: 'about',
        extension: '.md'
      })
    ]))
  })

  test('GET /_content with only', async () => {
    const items = await get('/_content', {
      json: true,
      qs: {
        only: ['title']
      }
    })

    expect(items).toEqual(expect.arrayContaining([
      { title: 'Home' },
      { title: 'About' }
    ]))
  })

  test('GET /_content with without', async () => {
    const items = await get('/_content', {
      json: true,
      qs: {
        without: ['body', 'createdAt', 'updatedAt', 'toc']
      }
    })

    expect(items).toEqual(expect.arrayContaining([
      { title: 'Home', dir: '/', extension: '.md', path: '/home', slug: 'home' },
      { title: 'About', dir: '/', extension: '.md', path: '/about', slug: 'about' }
    ]))
  })

  test('GET /_content/home', async () => {
    const page = await get('/_content/home', { json: true })

    expect(page).toEqual(expect.objectContaining({
      title: 'Home',
      dir: '/',
      path: '/home',
      slug: 'home'
    }))
  })

  test('GET /_content/home with only', async () => {
    const page = await get('/_content/home', {
      json: true,
      qs: {
        only: ['title']
      }
    })

    expect(page).toEqual({
      title: 'Home'
    })
  })

  test('GET /_content/home with without', async () => {
    const page = await get('/_content/home', {
      json: true,
      qs: {
        without: ['body', 'createdAt', 'updatedAt', 'toc']
      }
    })

    expect(page).toEqual({
      title: 'Home',
      dir: '/',
      extension: '.md',
      path: '/home',
      slug: 'home'
    })
  })

  test('GET /_content/404', async () => {
    await expect(get('/_content/404', { json: true })).rejects.toThrow(new StatusCodeError(404, { message: '/404 not found' }))
  })

  test('POST /_content/articles without body', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST'
    })

    expect(items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        title: 'Build a DEV.TO clone with Nuxt new fetch'
      }),
      expect.objectContaining({
        title: 'Understanding how fetch works in Nuxt 2.12'
      }),
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      }),
      expect.objectContaining({
        title: 'Introducing Smart Prefeching'
      })
    ]))
  })

  test('POST /_content/articles with sortBy (object)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        sortBy: {
          date: 'desc'
        },
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'Build a DEV.TO clone with Nuxt new fetch'
      }),
      expect.objectContaining({
        title: 'Understanding how fetch works in Nuxt 2.12'
      }),
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      }),
      expect.objectContaining({
        title: 'Introducing Smart Prefeching'
      })
    ])
  })

  test('POST /_content/articles with sortBy (object)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        sortBy: {
          date: 'desc'
        },
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'Build a DEV.TO clone with Nuxt new fetch'
      }),
      expect.objectContaining({
        title: 'Understanding how fetch works in Nuxt 2.12'
      }),
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      }),
      expect.objectContaining({
        title: 'Introducing Smart Prefeching'
      })
    ])
  })

  test('POST /_content/articles with sortBy (array)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        sortBy: [{
          date: 'desc'
        }],
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'Build a DEV.TO clone with Nuxt new fetch'
      }),
      expect.objectContaining({
        title: 'Understanding how fetch works in Nuxt 2.12'
      }),
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      }),
      expect.objectContaining({
        title: 'Introducing Smart Prefeching'
      })
    ])
  })

  test('GET /_content/articles with sortBy (string)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      qs: {
        sortBy: 'date:desc',
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'Build a DEV.TO clone with Nuxt new fetch'
      }),
      expect.objectContaining({
        title: 'Understanding how fetch works in Nuxt 2.12'
      }),
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      }),
      expect.objectContaining({
        title: 'Introducing Smart Prefeching'
      })
    ])
  })

  test('POST /_content/articles with limit (number)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        limit: 1,
        sortBy: [{
          date: 'desc'
        }],
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'Build a DEV.TO clone with Nuxt new fetch'
      })
    ])
  })

  test('POST /_content/articles with limit (string)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        limit: '1',
        sortBy: [{
          date: 'desc'
        }],
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'Build a DEV.TO clone with Nuxt new fetch'
      })
    ])
  })

  test('POST /_content/articles with skip (number)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        skip: 1,
        limit: 1,
        sortBy: [{
          date: 'desc'
        }],
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'Understanding how fetch works in Nuxt 2.12'
      })
    ])
  })

  test('POST /_content/articles with skip (string)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        skip: '1',
        limit: '1',
        sortBy: [{
          date: 'desc'
        }],
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'Understanding how fetch works in Nuxt 2.12'
      })
    ])
  })

  test('GET /_content/articles with search (string)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      qs: {
        search: 'browser',
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      })
    ])
  })

  test('POST /_content/articles with search (string)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        search: {
          query: 'browser'
        },
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      })
    ])
  })

  test('POST /_content/articles with search in field (string)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        search: {
          query: 'title',
          value: 'browser'
        },
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      })
    ])
  })

  test('POST /_content/articles with search (object)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        search: {
          query: {
            query: {
              type: 'match',
              field: 'title',
              value: 'browser',
              prefix_length: 1,
              fuzziness: 1,
              extended: true,
              minimum_should_match: 1
            }
          }
        },
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      })
    ])
  })

  test('GET /_content/articles with where', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'GET',
      qs: {
        tags_contains: 'webpack',
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      })
    ])
  })

  test('POST /_content/articles with where (object)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        where: {
          tags: {
            $contains: 'webpack'
          }
        },
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      })
    ])
  })

  test('POST /_content/articles with surround (object) of 404 slug', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        sortBy: {
          date: 'desc'
        },
        surround: {
          slug: '404',
          options: {
            before: 1,
            after: 1
          }
        },
        only: ['title']
      }
    })

    expect(items).toEqual([
      null,
      null
    ])
  })

  test('POST /_content/articles with surround (object)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        sortBy: {
          date: 'desc'
        },
        surround: {
          slug: 'understanding-how-fetch-works-in-nuxt-2-12'
        }
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'Build a DEV.TO clone with Nuxt new fetch'
      }),
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      })
    ])
  })

  test('POST /_content/articles with surround as first (object)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        sortBy: {
          date: 'desc'
        },
        surround: {
          slug: 'build-dev-to-clone-with-nuxt-new-fetch'
        }
      }
    })

    expect(items).toEqual([
      null,
      expect.objectContaining({
        title: 'Understanding how fetch works in Nuxt 2.12'
      })
    ])
  })

  test('POST /_content/articles with surround as last (object)', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        sortBy: {
          date: 'desc'
        },
        surround: {
          slug: 'introducing-smart-prefetching'
        }
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      }),
      null
    ])
  })

  test('POST /_content/articles/2020/04', async () => {
    const items = await get('/_content/articles/2020/04', {
      json: true,
      method: 'POST',
      body: {
        only: ['title']
      }
    })

    expect(items).toEqual([
      expect.objectContaining({
        title: 'April Newsletter'
      })
    ])
  })

  test('POST /_content/articles/2020', async () => {
    const items = await get('/_content/articles/2020', {
      json: true,
      method: 'POST',
      body: {
        only: ['title']
      }
    })

    expect(items).toEqual([])
  })

  test('POST /_content/articles with deep', async () => {
    const items = await get('/_content/articles', {
      json: true,
      method: 'POST',
      body: {
        only: ['title'],
        deep: true
      }
    })

    expect(items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      }),
      expect.objectContaining({
        title: 'Introducing Smart Prefeching'
      }),
      expect.objectContaining({
        title: 'Understanding how fetch works in Nuxt 2.12'
      }),
      expect.objectContaining({
        title: 'Build a DEV.TO clone with Nuxt new fetch'
      }),
      expect.objectContaining({
        title: 'April Newsletter'
      }),
      expect.objectContaining({
        title: 'May Newsletter'
      })
    ]))
  })

  test('POST /_content/articles/2020 with deep', async () => {
    const items = await get('/_content/articles/2020', {
      json: true,
      method: 'POST',
      body: {
        only: ['title'],
        deep: true
      }
    })

    expect(items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        title: 'April Newsletter'
      }),
      expect.objectContaining({
        title: 'May Newsletter'
      })
    ]))
  })

  test('GET /_content/articles/2020 with deep', async () => {
    const items = await get('/_content/articles/2020', {
      json: true,
      method: 'GET',
      qs: {
        only: ['title'],
        deep: true
      }
    })

    expect(items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        title: 'April Newsletter'
      }),
      expect.objectContaining({
        title: 'May Newsletter'
      })
    ]))
  })

  test('GET /_content/home should have valid dates', async () => {
    const item = await get('/_content/home', {
      json: true,
      method: 'GET'
    })

    expect(typeof item.createdAt).toBe('string')
    expect(typeof item.updatedAt).toBe('string')
  })

  test('GET /_content/home with text', async () => {
    const item = await get('/_content/home', {
      json: true,
      method: 'GET',
      qs: {
        text: true
      }
    })

    expect(item).toHaveProperty('text')
  })
})
