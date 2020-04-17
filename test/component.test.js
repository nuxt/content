const { createBrowser } = require('tib')
const { setup, loadConfig, url } = require('@nuxtjs/module-test-utils')

describe('component', () => {
  let nuxt, browser

  beforeAll(async () => {
    ({ nuxt } = (await setup(loadConfig(__dirname))))
    browser = await createBrowser('puppeteer')
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
    await browser.close()
  })

  test('nuxt-content has generated html', async () => {
    const page = await browser.page(url('/'))
    const html = await page.getHtml()

    expect(html).toContain('<h1>Home</h1> <div class="nuxt-content"><p>This is the home page!</p></div>')
  })
})
