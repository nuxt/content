const { setup, loadConfig } = require('@nuxtjs/module-test-utils')

describe('options', () => {
  describe('defaults', () => {
    let nuxt
    let options

    beforeAll(async () => {
      ({ nuxt } = (await setup(loadConfig(__dirname))))
      const { getOptions } = require('..')
      options = getOptions()
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
    })

    test('', () => {
      const remarkPlugins = [
        'remark-squeeze-paragraphs',
        'remark-slug',
        'remark-autolink-headings',
        'remark-external-links',
        'remark-footnotes'
      ]
      const rehypePlugins = [
        'rehype-sort-attribute-values',
        'rehype-sort-attributes',
        'rehype-raw'
      ]

      expect(options).toEqual(expect.objectContaining({
        apiPrefix: '_content',
        dir: 'content',
        fullTextSearchFields: ['title', 'description', 'slug', 'text'],
        nestedProperties: [],
        csv: {},
        yaml: {},
        markdown: expect.objectContaining({
          prism: {
            theme: 'prismjs/themes/prism.css'
          },
          remarkPlugins: expect.arrayContaining(remarkPlugins.map(name => ({ name, instance: require(name), options: undefined }))),
          rehypePlugins: expect.arrayContaining(rehypePlugins.map(name => ({ name, instance: require(name), options: undefined })))
        })
      }))
    })
  })

  describe('overriding plugin options', () => {
    let nuxt
    let options

    const config = {
      markdown: {
        remarkSlug: { option: 'a' }
      }
    }

    beforeAll(async () => {
      ({ nuxt } = (await setup(loadConfig(__dirname))))
      const { getOptions } = require('..')
      options = getOptions(config)
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
    })

    test('', () => {
      expect(options).toEqual(expect.objectContaining({
        markdown: expect.objectContaining({
          remarkPlugins: expect.arrayContaining([
            expect.objectContaining({ name: 'remark-slug', options: { option: 'a' } })
          ])
        })
      }))
    })
  })

  describe('adding not installed plugins', () => {
    let nuxt
    let options

    const config = {
      markdown: {
        remarkPlugins: ['remark-toto']
      }
    }

    beforeAll(async () => {
      ({ nuxt } = (await setup(loadConfig(__dirname))))
      const { getOptions } = require('..')
      options = getOptions(config)
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
    })

    test('', () => {
      expect(options).toEqual(expect.objectContaining({
        markdown: expect.objectContaining({
          remarkPlugins: expect.not.arrayContaining([
            expect.objectContaining({ name: 'remark-toto' })
          ])
        })
      }))
    })
  })

  describe('adding plugins with options', () => {
    let nuxt
    let options

    const config = {
      markdown: {
        remarkPlugins: () => [['remark-slug', { option: 'a' }]]
      }
    }

    beforeAll(async () => {
      ({ nuxt } = (await setup(loadConfig(__dirname))))
      const { getOptions } = require('..')
      options = getOptions(config)
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
    })

    test('', () => {
      expect(options).toEqual(expect.objectContaining({
        markdown: expect.objectContaining({
          remarkPlugins: expect.not.arrayContaining([
            expect.objectContaining({ name: 'remark-toto', options: { option: 'a' } })
          ])
        })
      }))
    })
  })
})
