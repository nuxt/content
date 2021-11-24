import { createPage } from '@nuxt/test-utils'
import { expect, assert } from 'chai'
import type { Page } from 'playwright'
import { setupTest } from '../utils'
import navigationTest from './navigation.test.partial'

describe('Features', () => {
  beforeEach(done => {
    setTimeout(done, 1000)
  })

  setupTest({
    browser: true,
    fixture: '../example',
    waitFor: 0,
    config: {
      dev: true,
      content: {
        locales: {
          codes: ['en', 'fa']
        },
        dirs: ['content', ['../test/contents/navigation', 'navigation']]
      }
    }
  })

  describe('Native Markdown', () => {
    let page: Page, html

    it('Render a page', async () => {
      page = await createPage('/features/native-markdown')
      html = await page.innerHTML('body')

      assert(html !== null)

      // Wait 1s
      await new Promise(resolve => setTimeout(resolve, 1000))
    })

    it('Displays links', async () => {
      const el = await page.$('#links a')
      assert(el !== null, 'Link should exist')

      await el!.textContent().then(text => expect(text).to.equal('Nuxt.js official website'))
      await el!.getAttribute('href').then(text => expect(text).to.equal('https://nuxtjs.org'))
    })

    it('Displays headings', async () => {
      const expectHeading = async (heading: string, text: string) => {
        const el = await page.$(heading)

        assert(el !== null)
        // Check heading id
        await el!.getAttribute('id').then(id => expect(id).to.equal(text.toLocaleLowerCase()))

        // Check inner link href
        await el!
          .$('a')
          .then(a => a?.getAttribute('href'))
          .then(href => expect(String(href).endsWith(`#${text.toLocaleLowerCase()}`)).to.equal(true))

        await el!.textContent().then(contetn => expect(contetn).to.equal(text))
      }
      await expectHeading('#headings h1', 'H1')
      await expectHeading('#headings h2', 'H2')
      await expectHeading('#headings h3', 'H3')
      await expectHeading('#headings h4', 'H4')
      await expectHeading('#headings h5', 'H5')
      await expectHeading('#headings h6', 'H6')
    })

    it('Displays unordered lists', async () => {
      const el = await page.$('#lists > ul')
      assert(el !== null)

      const html = await el!.innerHTML()
      expect(html).to.equal(
        '\n<li>First item</li>\n<li>Second item</li>\n<li>Third item\n<ul>\n<li>Indented item</li>\n<li>Indented item</li>\n</ul>\n</li>\n<li>Fourth item</li>\n'
      )
    })

    it('Displays ordered lists', async () => {
      const el = await page.$('#lists > ol')
      assert(el !== null)

      const html = await el!.innerHTML()
      expect(html).to.equal(
        '\n<li>First item</li>\n<li>Second item\n<ul>\n<li>Indented item</li>\n<li>Indented item</li>\n</ul>\n</li>\n<li>Third item\n<ol>\n<li>Indented item</li>\n<li>Indented item</li>\n</ol>\n</li>\n<li>Fourth item</li>\n'
      )
    })

    it('Displays inline code', async () => {
      const codes = await page.$$('#codes code')

      assert(codes[0] !== null)
      expect(await codes[0]!.textContent()).to.equal('nano')

      assert(codes[1] !== null)
      expect(await codes[1]!.innerHTML()).to.equal('Use `code` in your Markdown file.')
    })

    it('Displays code blocks', async () => {
      const pre = await page.$('#codes pre')
      assert(pre !== null)

      expect(await pre!.getAttribute('class')).to.equal('language-js line-numbers')

      expect(await pre!.textContent()).to.equal('export default {}\n')

      expect(await pre!.innerHTML()).to.equal(
        '<code ignoremap="true"><span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>\n</code>'
      )
    })

    it('Displays horizontal rule', async () => {
      const pre = await page.$$('#hr hr')
      assert(pre.length === 3)
    })

    navigationTest()
  })
})
