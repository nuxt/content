import { createPage } from '@nuxt/test-utils'
import { setupTest } from '../utils'

describe('Render Home Page', () => {
  setupTest({
    browser: true,
    fixture: '../example',
    waitFor: 8000,
    config: {
      dev: true
    }
  })

  test('Page Title', async () => {
    const page = await createPage('/')
    const html = await page.innerHTML('body')
    expect(html).toContain('Hello')

    expect(html).toContain('<span>span</span>')
  })

  test('Native Markdown -- headings', async () => {
    const page = await createPage('/features/native-markdown')
    const html = await page.innerHTML('body')

    expect(html).not.toBeNull()

    const expectHeading = async (heading: string, text: string) => {
      const el = await page.$(heading)

      expect(el).not.toBeNull()
      // check heading id
      await el.getAttribute('id').then(id => expect(id).toEqual(text.toLocaleLowerCase()))

      // check inner link href
      await el
        .$('a')
        .then(a => a.getAttribute('href'))
        .then(href => expect(href.endsWith(`#${text.toLocaleLowerCase()}`)).toBeTruthy())

      await el.textContent().then(text => expect(text).toEqual(text))
    }
    await expectHeading('#headings h1', 'H1')
    await expectHeading('#headings h2', 'H2')
    await expectHeading('#headings h3', 'H3')
    await expectHeading('#headings h4', 'H4')
    await expectHeading('#headings h5', 'H5')
    await expectHeading('#headings h6', 'H6')
  })
})
