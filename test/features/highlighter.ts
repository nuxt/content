import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

const content = [
  '```ts',
  'const a: number = 1',
  '```'
].join('\n')

export const testHighlighter = () => {
  describe('Highlighter', () => {
    test('themed', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content
        }
      })

      expect(parsed).toHaveProperty('_id')
      assert(parsed._id === 'content:index.md')

      const styleElement = parsed.body.children.pop()
      expect(styleElement.tag).toBe('style')
      const style = styleElement.children[0].value

      const code = parsed.body.children[0].children[0].children[0].children[0].children

      expect(style).toContain(`.${code[0].props.class}{color:#CF222E}`)
      expect(style).toContain(`.dark .${code[0].props.class}{color:#FF7B72}`)

      expect(style).toContain(`.${code[1].props.class}{color:#24292F}`)
      expect(style).toContain(`.dark .${code[1].props.class}{color:#C9D1D9}`)

      expect(style).toContain(`.${code[2].props.class}{color:#0550AE}`)
      expect(style).toContain(`.dark .${code[2].props.class}{color:#79C0FF}`)

      expect(style).toContain(`.${code[3].props.class}{color:#CF222E}`)
      expect(style).toContain(`.dark .${code[3].props.class}{color:#FF7B72}`)

      expect(style).toContain(`.${code[4].props.class}{color:#24292F}`)
      expect(style).toContain(`.dark .${code[4].props.class}{color:#C9D1D9}`)

      expect(style).toContain(`.${code[5].props.class}{color:#0550AE}`)
      expect(style).toContain(`.dark .${code[5].props.class}{color:#79C0FF}`)

      expect(style).toContain(`.${code[6].props.class}{color:#24292F}`)
      expect(style).toContain(`.dark .${code[6].props.class}{color:#C9D1D9}`)

      expect(style).toContain(`.${code[7].props.class}{color:#CF222E}`)
      expect(style).toContain(`.dark .${code[7].props.class}{color:#FF7B72}`)

      expect(style).toContain(`.${code[8].props.class}{color:#24292F}`)
      expect(style).toContain(`.dark .${code[8].props.class}{color:#C9D1D9}`)

      expect(style).toContain(`.${code[9].props.class}{color:#0550AE}`)
      expect(style).toContain(`.dark .${code[9].props.class}{color:#79C0FF}`)
    })
  })
}
