const path = require('path')
const { createBrowser } = require('tib')
const { setup, loadConfig, url } = require('@nuxtjs/module-test-utils')

describe('editor option', () => {
  let nuxt, browser, page

  describe('alias works', () => {
    test('local alias', async () => {
      ({ nuxt } = (await setup({
        ...loadConfig(__dirname),
        buildDir: path.join(__dirname, 'fixture', '.nuxt-dev'),
        content: { watch: true, editor: '~/.nuxt-dev/content/editor.vue' }
      })))

      browser = await createBrowser('puppeteer')
      page = await browser.page(url('/home'))
      const html = await page.getHtml()

      expect(html).toMatch(/<div><h1>.*<\/h1>\s*<div\s*.*class="nuxt-content-container"\s*.*><textarea.*><\/textarea>\s*<div\s*.*class="nuxt-content"\s*.*><p.*>This is the home page!<\/p><\/div><\/div><\/div>/)

      await nuxt.close()
      await browser.close()
    }, 60000)

    test('module resolution', async () => {
      ({ nuxt } = (await setup({
        ...loadConfig(__dirname),
        buildDir: path.join(__dirname, 'fixture', '.nuxt-dev'),
        content: { watch: true, editor: '@nuxt/content/templates/editor.vue' }
      })))

      browser = await createBrowser('puppeteer')
      page = await browser.page(url('/home'))
      const html = await page.getHtml()

      expect(html).toMatch(/<div><h1>.*<\/h1>\s*<div\s*.*class="nuxt-content-container"\s*.*><textarea.*><\/textarea>\s*<div\s*.*class="nuxt-content"\s*.*><p.*>This is the home page!<\/p><\/div><\/div><\/div>/)

      await nuxt.close()
      await browser.close()
    }, 60000)
  })

  describe('replacing works', () => {
    test('replacing', async () => {
      ({ nuxt } = (await setup({
        ...loadConfig(__dirname),
        buildDir: path.join(__dirname, 'fixture', '.nuxt-dev'),
        content: { watch: true, editor: '~/components/editor.vue' }
      })))

      browser = await createBrowser('puppeteer')
      page = await browser.page(url('/home'))
      const html = await page.getHtml()

      expect(html).toMatch(/<div><h1>.*<\/h1>\s*<div\s*.*class="nuxt-content-container"\s*.*><div .*class="editor.*><\/div>\s*<div\s*.*class="nuxt-content"\s*.*><p.*>This is the home page!<\/p><\/div><\/div><\/div>/)

      await nuxt.close()
      await browser.close()
    }, 60000)
  })
})
