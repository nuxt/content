const { setup, loadConfig } = require('@nuxtjs/module-test-utils')

describe('options', () => {
  describe('defaults', () => {
    let nuxt
    let options

    beforeAll(async () => {
      ({ nuxt } = (await setup(loadConfig(__dirname))))
      const { getOptions } = require('@nuxt/content')
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
        useCache: false,
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
      const { getOptions } = require('@nuxt/content')
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
      const { getOptions } = require('@nuxt/content')
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
      const { getOptions } = require('@nuxt/content')
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

  describe('adding extend parser', () => {
    let nuxt
    let $content

    const config = {
      content: {
        extendParser: {
          '.txt': file => ({ body: file })
        }
      }
    }

    beforeAll(async () => {
      ({ nuxt } = (await setup({ ...loadConfig(__dirname), ...config })))
      const module = require('@nuxt/content')
      $content = module.$content
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
    })

    test('$content() on not-parsed.txt file', async () => {
      const item = await $content('not-parsed').fetch()

      expect(item).toEqual(
        expect.objectContaining({
          dir: '/',
          path: '/not-parsed',
          slug: 'not-parsed',
          extension: '.txt',
          body: 'Not parsed without a custom parser'
        })
      )
    })
  })

  describe('table of contents', () => {
    describe('overriding content.markdown.tocDepth option', () => {
      let nuxt
      let options

      const config = {
        markdown: {
          tocDepth: 0
        }
      }

      beforeAll(async () => {
        ({ nuxt } = (await setup(loadConfig(__dirname))))
        const { getOptions } = require('@nuxt/content')
        options = getOptions(config)
      }, 60000)

      afterAll(async () => {
        await nuxt.close()
      })

      test('', () => {
        expect(options).toEqual(expect.objectContaining({
          markdown: expect.objectContaining({
            tocDepth: 0
          })
        }))
      })
    })

    describe('generated default table of contents', () => {
      let nuxt
      let $content

      beforeAll(async () => {
        ({ nuxt } = (await setup(loadConfig(__dirname))))
        const module = require('@nuxt/content')
        $content = module.$content
      }, 60000)

      afterAll(async () => {
        await nuxt.close()
      })

      test('', async () => {
        const item = await $content('toc').fetch()

        expect(item).toEqual(
          expect.objectContaining({
            toc: expect.arrayContaining([
              expect.objectContaining({ depth: 2, id: 'heading-a-2', text: 'Heading A-2' }),
              expect.objectContaining({ depth: 3, id: 'heading-a-3', text: 'Heading A-3' }),
              expect.objectContaining({ depth: 2, id: 'heading-b-2', text: 'Heading B-2' }),
              expect.objectContaining({ depth: 3, id: 'heading-b-3', text: 'Heading B-3' })
            ])
          })
        )
      })
    })

    describe('generated table of contents for document with wrapper div', () => {
      let nuxt
      let $content

      beforeAll(async () => {
        ({ nuxt } = (await setup(loadConfig(__dirname))))
        const module = require('@nuxt/content')
        $content = module.$content
      }, 60000)

      afterAll(async () => {
        await nuxt.close()
      })

      test('', async () => {
        const item = await $content('toc-dom-depth-2').fetch()

        expect(item).toEqual(
          expect.objectContaining({
            toc: expect.arrayContaining([
              expect.objectContaining({ depth: 2, id: 'heading-a-2', text: 'Heading A-2' }),
              expect.objectContaining({ depth: 2, id: 'heading-b-2', text: 'Heading B-2' }),
              expect.objectContaining({ depth: 3, id: 'heading-b-3', text: 'Heading B-3' }),
              expect.objectContaining({ depth: 2, id: 'heading-c-2', text: 'Heading C-2' }),
              expect.objectContaining({ depth: 3, id: 'heading-c-3', text: 'Heading C-3' })
            ])
          })
        )
      })
    })

    describe('generated table of contents with depth 1', () => {
      let nuxt
      let $content

      const config = {
        content: {
          markdown: {
            tocDepth: 1
          }
        }
      }

      beforeAll(async () => {
        ({ nuxt } = (await setup({ ...loadConfig(__dirname), ...config })))
        const module = require('@nuxt/content')
        $content = module.$content
      }, 60000)

      afterAll(async () => {
        await nuxt.close()
      })

      test('depth 1', async () => {
        const item = await $content('toc').fetch()

        expect(item).toEqual(
          expect.objectContaining({
            toc: expect.arrayContaining([])
          })
        )
      })
    })

    describe('generated table of contents with depth 6', () => {
      let nuxt
      let $content

      const config = {
        content: {
          markdown: {
            tocDepth: 6
          }
        }
      }

      beforeAll(async () => {
        ({ nuxt } = (await setup({ ...loadConfig(__dirname), ...config })))
        const module = require('@nuxt/content')
        $content = module.$content
      }, 60000)

      afterAll(async () => {
        await nuxt.close()
      })

      test('', async () => {
        const item = await $content('toc').fetch()

        expect(item).toEqual(
          expect.objectContaining({
            toc: expect.arrayContaining([
              expect.objectContaining({ depth: 2, id: 'heading-a-2', text: 'Heading A-2' }),
              expect.objectContaining({ depth: 3, id: 'heading-a-3', text: 'Heading A-3' }),
              expect.objectContaining({ depth: 4, id: 'heading-a-4', text: 'Heading A-4' }),
              expect.objectContaining({ depth: 5, id: 'heading-a-5', text: 'Heading A-5' }),
              expect.objectContaining({ depth: 6, id: 'heading-a-6', text: 'Heading A-6' }),
              expect.objectContaining({ depth: 2, id: 'heading-b-2', text: 'Heading B-2' }),
              expect.objectContaining({ depth: 3, id: 'heading-b-3', text: 'Heading B-3' }),
              expect.objectContaining({ depth: 4, id: 'heading-b-4', text: 'Heading B-4' }),
              expect.objectContaining({ depth: 5, id: 'heading-b-5', text: 'Heading B-5' }),
              expect.objectContaining({ depth: 6, id: 'heading-b-6', text: 'Heading B-6' })
            ])
          })
        )
      })
    })
  })
})
