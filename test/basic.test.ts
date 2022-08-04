import { fileURLToPath } from 'url'
import { assert, test, describe, expect, vi } from 'vitest'
import { setup, $fetch, isDev } from '@nuxt/test-utils'
import { hash } from 'ohash'
import { testMarkdownParser } from './features/parser-markdown'
import { testPathMetaTransformer } from './features/transformer-path-meta'
import { testYamlParser } from './features/parser-yaml'
import { testNavigation } from './features/navigation'
// import { testMDCComponent } from './features/mdc-component'
import { testJSONParser } from './features/parser-json'
import { testCSVParser } from './features/parser-csv'
import { testRegex } from './features/regex'
import { testMarkdownParserExcerpt } from './features/parser-markdown-excerpt'
import { testHMR } from './features/hmr'
import { testParserHooks } from './features/parser-hooks'
import { testModuleOptions } from './features/module-options'
import { testContentQuery } from './features/content-query'
import { testHighlighter } from './features/highlighter'
import { testMarkdownRenderer } from './features/renderer-markdown'
import { testParserOptions } from './features/parser-options'

const fixturePath = fileURLToPath(new URL('./fixtures/basic', import.meta.url))

describe('Basic usage', async () => {
  const spyConsoleWarn = vi.spyOn(global.console, 'warn')
  await setup({
    rootDir: fixturePath,
    browser: true,
    server: true
  })

  const QUERY_ENDPOINT = '/api/_content/query'
  const fetchDocument = (_id: string) => {
    const params = { first: true, where: { _id } }
    const qid = hash(params)
    return $fetch(`${QUERY_ENDPOINT}/${qid}`, {
      params: { _params: JSON.stringify(params) }
    })
  }

  test('List contents', async () => {
    const params = { only: '_id' }
    const qid = hash(params)
    const docs = await $fetch(`${QUERY_ENDPOINT}/${qid}`, {
      params: { _params: JSON.stringify(params) }
    })

    const ids = docs.map(doc => doc._id)

    assert(ids.length > 0)
    assert(ids.includes('content:index.md'))

    // Ignored files should be listed
    assert(ids.includes('content:.dot-ignored.md') === false, 'Ignored files with `.` should not be listed')
    assert(ids.includes('content:-dash-ignored.md') === false, 'Ignored files with `-` should not be listed')

    assert(ids.includes('fa-ir:fa:hello.md') === true, 'Files with `fa-ir` prefix should be listed')
  })

  test('Get contents index', async () => {
    const index = await fetchDocument('content:index.md')

    expect(index).toHaveProperty('body')

    expect(index.body).toMatchSnapshot('basic-index-body')
  })

  test('Get ignored contents', async () => {
    const ignored = await fetchDocument('content:.dot-ignored.md').catch(_err => null)

    expect(ignored).toBeNull()
  })

  test('Search contents using `locale` helper', async () => {
    const fa = await $fetch('/locale-fa')

    expect(fa).toContain('fa-ir:fa:hello.md')
    expect(fa).not.toContain('content:index.md')

    const en = await $fetch('/locale-en')

    expect(en).not.toContain('fa-ir:fa:hello.md')
    expect(en).toContain('content:index.md')
  })

  test('Use default locale for unscoped contents', async () => {
    const index = await fetchDocument('content:index.md')

    expect(index).toMatchObject({
      _locale: 'en'
    })
  })

  test('Multi part path', async () => {
    const html = await $fetch('/features/multi-part-path')
    expect(html).contains('Persian')
  })

  test('<ContentDoc> head management (if same path)', async () => {
    const html = await $fetch('/head')
    expect(html).contains('<title>Head overwritten</title>')
    expect(html).contains('<meta property="og:image" content="https://picsum.photos/200/300">')
    expect(html).contains('<meta name="description" content="Description overwritten"><meta property="og:image" content="https://picsum.photos/200/300">')
  })
  test('<ContentDoc> head management (not same path)', async () => {
    const html = await $fetch('/bypass-head')
    expect(html).not.contains('<title>Head overwritten</title>')
    expect(html).not.contains('<meta property="og:image" content="https://picsum.photos/200/300">')
    expect(html).not.contains('<meta name="description" content="Description overwritten"><meta property="og:image" content="https://picsum.photos/200/300">')
  })

  test('Partials specials chars', async () => {
    const html = await $fetch('/_partial/content-(v2)')
    expect(html).contains('Content (v2)')
  })

  test('Partials specials chars', async () => {
    const html = await $fetch('/_partial/markdown')
    expect(html).contains('><!--[--> Default title <!--]--></h1>')
    expect(html).contains('<p><!--[-->p1<!--]--></p>')
  })

  test('Warning for invalid file name', () => {
    expect(spyConsoleWarn).toHaveBeenCalled()
    expect(spyConsoleWarn).toHaveBeenCalledWith('Ignoring [content:with-\'invalid\'-char.md]. File name should not contain any of the following characters: \', ", ?, #, /')
  })

  testContentQuery()

  testNavigation()

  testMarkdownParser()
  testMarkdownRenderer()

  testMarkdownParserExcerpt()

  testYamlParser()

  testCSVParser()

  testJSONParser()

  testPathMetaTransformer()

  // testMDCComponent()

  testRegex()

  testParserHooks()

  testModuleOptions()

  testHighlighter()

  testParserOptions()

  if (isDev()) {
    await testHMR(fixturePath)
    return
  }

  test('Warning for invalid file name', () => {
    expect(spyConsoleWarn).toHaveBeenCalled()
    expect(spyConsoleWarn).toHaveBeenCalledWith('Ignoring [content:with-\'invalid\'-char.md]. File name should not contain any of the following characters: \', ", ?, #, /')
  })
})
