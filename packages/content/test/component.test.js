const path = require('path')
const { createBrowser } = require('tib')
const { setup, loadConfig, url } = require('@nuxtjs/module-test-utils')

describe('component', () => {
  let nuxt, browser, page

  describe('', () => {
    beforeAll(async () => {
      ({ nuxt } = (await setup(loadConfig(__dirname))))
      browser = await createBrowser('puppeteer')
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
      await browser.close()
    })

    test('has generated html', async () => {
      page = await browser.page(url('/home'))
      const html = await page.getHtml()

      expect(html).toContain('<h1>Home</h1> <div class="nuxt-content"><p>This is the home page!</p></div>')
    })

    test('has generated html with id', async () => {
      page = await browser.page(url('/home?withId=true'))
      const html = await page.getHtml()

      expect(html).toContain('<h1>Home</h1> <div id="my-id" class="nuxt-content"><p>This is the home page!</p></div>')
    })

    test('has generated html with class', async () => {
      page = await browser.page(url('/home?withClass=true'))
      const html = await page.getHtml()

      expect(html).toContain('<h1>Home</h1> <div class="my-class nuxt-content"><p>This is the home page!</p></div>')
    })

    test('has rendered a Vue.js component', async () => {
      page = await browser.page(url('/vue-component'))
      const html = await page.getHtml()

      expect(html).toMatch(
        new RegExp(/<div>\s*<h1><\/h1>\s*<div class="nuxt-content">\s*<div>\s*<header>Header content<\/header>\s*<main>\s*Main content\s*<\/main>\s*<footer>Footer content<\/footer><\/div><\/div><\/div>/)
      )
    })

    test('has rendered html props correctly', async () => {
      page = await browser.page(url('/html'))
      const html = await page.getHtml()

      expect(html).toMatch(
        new RegExp(/<div>\s*<h1><\/h1>\s*<div class="nuxt-content">\s*<h2 id="header">\s*<a aria-hidden="true" href="#header" tabindex="-1">\s*<span class="icon icon-link">\s*<\/span>\s*<\/a>Header<\/h2>\s*<p>\s*<video autoplay="autoplay" loop="loop" playsinline="true" controls="controls"><\/video><\/p>\s*<\/div><\/div>/)
      )
    })
  })

  describe('in dev mode', () => {
    beforeAll(async () => {
      ({ nuxt } = (await setup({
        ...loadConfig(__dirname),
        buildDir: path.join(__dirname, 'fixture', '.nuxt-dev'),
        content: { watch: true }
      })))
      browser = await createBrowser('puppeteer')
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
      await browser.close()
    })

    test('has generated html', async () => {
      page = await browser.page(url('/home'))
      const html = await page.getHtml()

      expect(html).toMatch(/<div><h1>.*<\/h1>\s*<div\s*.*class="nuxt-content-container"\s*.*><textarea.*><\/textarea>\s*<div\s*.*class="nuxt-content"\s*.*><p.*>This is the home page!<\/p><\/div><\/div><\/div>/)
    })

    test('has generated html with id', async () => {
      page = await browser.page(url('/home?withId=true'))
      const html = await page.getHtml()

      expect(html).toMatch(/<div><h1>.*<\/h1>\s*<div\s*.*id="my-id"\s*class="nuxt-content-container"\s*.*><textarea.*><\/textarea>\s*<div\s*.*class="nuxt-content"\s*.*id="my-id"\s*.*><p.*>This is the home page!<\/p><\/div><\/div><\/div>/)
    })

    test('has generated html with class', async () => {
      page = await browser.page(url('/home?withClass=true'))
      const html = await page.getHtml()

      expect(html).toMatch(/<div><h1>.*<\/h1>\s*<div\s*.*class="nuxt-content-container"\s*.*><textarea.*><\/textarea>\s*<div\s*.*class="my-class nuxt-content"\s*.*><p.*>This is the home page!<\/p><\/div><\/div><\/div>/)
    })
  })
})
