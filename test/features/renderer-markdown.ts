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


::alert
---
type: success
---
This is an alert for {{ type }}
::

::alert{type="danger"}
This is an alert for {{ type }}
::

`

export const testMarkdownRenderer = () => {
  describe('renderer:markdown', () => {
    test('bindings', async () => {
      const rendered = await $fetch('/parse', {
        params: {
          content
        }
      })

      expect(rendered).toContain('<img src="https://nuxtjs.org/design-kit/colored-logo.svg" alt>')

      expect(rendered).toContain('<h1 id><!--[-->MDC<!--]--></h1>')
      expect(rendered).toContain('You are visiting document: content:index.md.')
      expect(rendered).toContain('Current route is: /parse')
      expect(rendered).toContain('This is an alert for success')
      expect(rendered).toContain('This is an alert for danger')
    })
  })
}
