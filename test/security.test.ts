import { expect, test, describe } from 'vitest'
import { transformContent } from '../src/runtime/transformers'
import { safeSink, unsafeLinkPrefix } from '../src/runtime/markdown-parser/utils/attrs'

describe('XSS', () => {
  test('anchor', async () => {
    const { body } = await transformContent(
      'content:index.md',
      [
        '[a](javascript://www.google.com%0Aprompt(1))',
        '[a](JaVaScRiPt:alert(1))',
        '[XSS](vbscript:alert(document.domain))',
        '[x](y \'<style>\')',
        '<javascript:prompt(document.cookie)>'
      ].join('\n\n')
    )

    for (let child of body.children) {
      if (child.tag === 'p') {
        child = child.children[0]
      }
      expect(child.tag).toBe('a')
      expect(Object.keys(child.props).every(p => safeSink.includes(p))).toBeTruthy()
      expect(unsafeLinkPrefix.some(p => child.props.href.startsWith(p))).toBeFalsy()
    }
  })
  test('image', async () => {
    const { body } = await transformContent(
      'content:index.md',
      [
        '![](x){onerror=alert(1) onload="alert(\'XSS\')" }',
        '![a]("onerror="alert(1))',
        '![](contenteditable/autofocus/onfocus=confirm(\'qwq\')//)">',
        '![XSS](data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K)',
        '<img src=x onerror=alert(1) onload="alert(\'XSS\')" />',
        '<img src=x onerror=alert(1)>">yep</a>',
        '![XSS]("onerror="alert(\'XSS\'))',
        '![XSS](https://www.example.com/image.png"onload="alert(\'XSS\'))',
        '![onload](https://www.example.com/image.png"onload="alert(\'ImageOnLoad\'))',
        '![onerror]("onerror="alert(\'ImageOnError\'))'
      ].join('\n\n')
    )

    for (let child of body.children) {
      if (child.tag === 'p') {
        child = child.children[0]
      }
      expect(child.tag).toBe('img')
      expect(Object.keys(child.props).every(p => safeSink.includes(p))).toBeTruthy()
      expect(unsafeLinkPrefix.some(p => child.props.src?.startsWith(p))).toBeFalsy()
    }
  })

  test('iframe', async () => {
    const { body } = await transformContent(
      'content:index.md',
      [
        ':iframe{src=x onerror=alert(1) onload="alert(\'XSS\')" }',
        '<iframe src=x onerror=alert(1) onload="alert(\'XSS\')" />'
      ].join('\n\n')
    )

    for (let child of body.children) {
      if (child.tag === 'p') {
        child = child.children[0]
      }
      expect(child.tag).toBe('iframe')
      expect(Object.keys(child.props).every(p => safeSink.includes(p))).toBeTruthy()
    }
  })
})
