const { createBrowser } = require('tib')
const { setup, loadConfig, url } = require('@nuxtjs/module-test-utils')

describe('plugin', () => {
  let nuxt, browser, page

  beforeAll(async () => {
    ({ nuxt } = (await setup(loadConfig(__dirname))))
    browser = await createBrowser('puppeteer')
    page = await browser.page(url('/'))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
    await browser.close()
  })

  test('$content() on root directory', async () => {
    const items = await page.runScript(() => window.$nuxt.$content().fetch())

    expect(items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        title: 'Home',
        dir: '/',
        path: '/home',
        slug: 'home'
      }),
      expect.objectContaining({
        title: 'About',
        dir: '/',
        path: '/about',
        slug: 'about'
      })
    ]))
  })

  test('$content() on root directory with fields', async () => {
    const items = await page.runScript(() => window.$nuxt.$content().fields(['title']).fetch())

    expect(items).toEqual(expect.arrayContaining([
      { title: 'Home' },
      { title: 'About' }
    ]))
  })

  test('$content() on file', async () => {
    const item = await page.runScript(() => window.$nuxt.$content('home').fetch())

    expect(item).toEqual(expect.objectContaining({
      title: 'Home',
      dir: '/',
      path: '/home',
      slug: 'home'
    }))
  })

  test('$content() on file with fields', async () => {
    const item = await page.runScript(() => window.$nuxt.$content('home').fields(['title']).fetch())

    expect(item).toEqual({
      title: 'Home'
    })
  })

  test('$content() on 404', async () => {
    await expect(page.runScript(() => window.$nuxt.$content('404').fetch())).rejects.toThrow(Error)
  })

  test('$content() on directory with sortBy', async () => {
    const items = await page.runScript(() => window.$nuxt.$content('articles').sortBy('date', 'desc').fields(['title']).fetch())

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

  test('$content() on directory with limit (number)', async () => {
    const items = await page.runScript(() => window.$nuxt.$content('articles').sortBy('date', 'desc').limit(1).fields(['title']).fetch())

    expect(items).toEqual([
      expect.objectContaining({
        title: 'Build a DEV.TO clone with Nuxt new fetch'
      })
    ])
  })

  test('$content() on directory with limit (string)', async () => {
    const items = await page.runScript(() => window.$nuxt.$content('articles').sortBy('date', 'desc').limit('1').fields(['title']).fetch())

    expect(items).toEqual([
      expect.objectContaining({
        title: 'Build a DEV.TO clone with Nuxt new fetch'
      })
    ])
  })

  test('$content() on directory with skip (number)', async () => {
    const items = await page.runScript(() => window.$nuxt.$content('articles').sortBy('date', 'desc').limit(1).skip(1).fields(['title']).fetch())

    expect(items).toEqual([
      expect.objectContaining({
        title: 'Understanding how fetch works in Nuxt 2.12'
      })
    ])
  })

  test('$content() on directory with skip (string)', async () => {
    const items = await page.runScript(() => window.$nuxt.$content('articles').sortBy('date', 'desc').limit('1').skip('1').fields(['title']).fetch())

    expect(items).toEqual([
      expect.objectContaining({
        title: 'Understanding how fetch works in Nuxt 2.12'
      })
    ])
  })

  test('$content() on directory with search', async () => {
    const items = await page.runScript(() => window.$nuxt.$content('articles').search('browser').fields(['title']).fetch())

    expect(items).toEqual([
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      })
    ])
  })

  test('$content() on directory with search in field', async () => {
    const items = await page.runScript(() => window.$nuxt.$content('articles').search('title', 'browser').fields(['title']).fetch())

    expect(items).toEqual([
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      })
    ])
  })

  test('$content() on directory with search (object)', async () => {
    const items = await page.runScript(() => window.$nuxt.$content('articles').search({
      query: {
        type: 'match',
        field: 'title',
        value: 'browser',
        prefix_length: 1,
        fuzziness: 1,
        extended: true,
        minimum_should_match: 1
      }
    }).fields(['title']).fetch())

    expect(items).toEqual([
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      })
    ])
  })

  test('$content() on directory with where', async () => {
    const items = await page.runScript(() => window.$nuxt.$content('articles').where({
      tags: {
        $contains: 'webpack'
      }
    }).fields(['title']).fetch())

    expect(items).toEqual([
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      })
    ])
  })

  test('$content() on directory with surround of 404 slug', async () => {
    const items = await page.runScript(() => window.$nuxt.$content('articles').surround('404').sortBy('date', 'desc').fields(['title']).fetch())

    expect(items).toEqual([
      null,
      null
    ])
  })

  test('$content() on directory with surround', async () => {
    const items = await page.runScript(() => window.$nuxt.$content('articles').surround('understanding-how-fetch-works-in-nuxt-2-12').sortBy('date', 'desc').fetch())

    expect(items).toEqual([
      expect.objectContaining({
        title: 'Build a DEV.TO clone with Nuxt new fetch'
      }),
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      })
    ])
  })

  test('$content() on directory with surround as first', async () => {
    const items = await page.runScript(() => window.$nuxt.$content('articles').surround('build-dev-to-clone-with-nuxt-new-fetch').sortBy('date', 'desc').fetch())

    expect(items).toEqual([
      null,
      expect.objectContaining({
        title: 'Understanding how fetch works in Nuxt 2.12'
      })
    ])
  })

  test('$content() on directory with surround as last', async () => {
    const items = await page.runScript(() => window.$nuxt.$content('articles').surround('introducing-smart-prefetching').sortBy('date', 'desc').fetch())

    expect(items).toEqual([
      expect.objectContaining({
        title: 'NuxtJS: From Terminal to Browser'
      }),
      null
    ])
  })
})
