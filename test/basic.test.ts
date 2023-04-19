import { fileURLToPath } from 'url'
import { test, describe, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { testMarkdownParser } from './features/parser-markdown'
import { testPathMetaTransformer } from './features/transformer-path-meta'
import { testYamlParser } from './features/parser-yaml'
import { testNavigation } from './features/navigation'
// import { testMDCComponent } from './features/mdc-component'
import { testJSONParser } from './features/parser-json'
import { testCSVParser } from './features/parser-csv'
import { testRegex } from './features/regex'
import { testMarkdownParserExcerpt } from './features/parser-markdown-excerpt'
import { testParserHooks } from './features/parser-hooks'
import { testModuleOptions } from './features/module-options'
import { testContentQuery } from './features/content-query'
import { testHighlighter } from './features/highlighter'
import { testMarkdownRenderer } from './features/renderer-markdown'
import { testParserOptions } from './features/parser-options'
import { testComponents } from './features/components'
import { testLocales } from './features/locales'
import { testIgnores } from './features/ignores'

// const spyConsoleWarn = vi.spyOn(global.console, 'warn')

describe('Basic usage', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    server: true
  })

  test('Multi part path', async () => {
    const html = await $fetch('/features/multi-part-path')
    expect(html).contains('Persian')
  })

  test('Japanese path', async () => {
    const html = await $fetch('/' + encodeURIComponent('こんにちは'))
    expect(html).contains('🎨 こんにちは')
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

  // test('Warning for invalid file name', () => {
  //   expect(spyConsoleWarn).toHaveBeenCalled()
  //   expect(spyConsoleWarn).toHaveBeenCalledWith('Ignoring [content:with-\'invalid\'-char.md]. File name should not contain any of the following characters: \', ", ?, #, /')
  // })

  testLocales()

  testComponents()

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

  testIgnores()
})
