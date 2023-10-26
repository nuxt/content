import { describe, test, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

const content = `---
title: MDC
cover: https://nuxtjs.org/design-kit/colored-logo.svg
---
:img{:src="cover"}

# {{ $doc.title }}

MDC stands for _**M**ark**D**own **C**omponents_.

This syntax supercharges regular Markdown to write documents interacting deeply with any Vue component from your \`components/content/\` directory or provided by a module.

## Next steps
- [Install Nuxt Content](/get-started)
- [Explore the MDC syntax](/guide/writing/mdc)


You are visiting document: {{ $doc._id }}.
Current route is: {{ $route.path }}


::callout
---
type: success
---
This is an alert for {{ type }}
::

::callout{type="danger"}
This is an alert for {{ type }}
::

`

export const testMarkdownRenderer = () => {
  describe('renderer:markdown', () => {
    test('bindings', async () => {
      const rendered = await $fetch('/parse', {
        params: {
          content: encodeURIComponent(content)
        }
      })

      expect(rendered).toContain('<img src="https://nuxtjs.org/design-kit/colored-logo.svg" alt>')

      expect(rendered).toContain('<h1 id><!--[-->MDC<!--]--></h1>')
      expect(rendered).toContain('You are visiting document: content:index.md.')
      expect(rendered).toContain('Current route is: /parse')
      expect(rendered).toContain('This is an alert for success')
      expect(rendered).toContain('This is an alert for danger')
    })

    test('per-page custom component', async () => {
      const html = await $fetch('/_partial/custom-paragraph')
      expect(html).contains('[Paragraph]')
    })

    test('renderer custom component', async () => {
      const html = await $fetch('/features/custom-paragraph')
      expect(html).contains('[Paragraph]')
    })

    test('override default slot', async () => {
      const html = await $fetch('/features/slotted-content-renderer')
      expect(html).contains('The default slot is overridden')
    })

    test('Empty slot', async () => {
      const html = await $fetch('/features/empty-slot')
      expect(html).contains('Nullish Document!!!')
      expect(html).contains('Empty Child!!!')
    })

    test('<ContentDoc> head management (if same path)', async () => {
      const html = await $fetch('/head')
      expect(html).contains('<title>Head overwritten</title>')
      expect(html).contains('<meta property="og:image" content="https://picsum.photos/200/300">')
      expect(html).contains('<meta name="description" content="Description overwritten">')
      expect(html).contains('<meta property="og:image" content="https://picsum.photos/200/300">')
    })

    test('<ContentDoc> head management (not same path)', async () => {
      const html = await $fetch('/bypass-head')
      expect(html).not.contains('<title>Head overwritten</title>')
      expect(html).not.contains('<meta property="og:image" content="https://picsum.photos/200/300">')
      expect(html).not.contains('<meta name="description" content="Description overwritten"><meta property="og:image" content="https://picsum.photos/200/300">')
    })

    test('XSS Prevention', async () => {
      const html = await $fetch('/_partial/xss')
      expect(html).contains('<div id="__nuxt"><!--[--><!--[--><div><p><!--[-->script: <!----><!--]--></p></div><!--]--><!--]--></div>')
    })
  })
}
