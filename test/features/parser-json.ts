import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

const json = `{
  "key": "value"
}`
const json5 = `{
  key: 'value',
  // comments
  unquoted: 'and you can quote me on that',
  singleQuotes: 'I can use "double quotes" here',
  lineBreaks: "Look, Mom! \
No \\n's!",
  hexadecimal: 0xdecaf,
  leadingDecimalPoint: .8675309, andTrailing: 8675309.,
  positiveSign: +1,
  trailingComma: 'in objects', andIn: ['arrays',],
  "backwardsCompatible": "with JSON",
}`

export const testJSONParser = () => {
  describe('parser:json', () => {
    test('key:value', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.json',
          content: json
        }
      })

      expect(parsed).toHaveProperty('id')
      assert(parsed.id === 'content:index.json')

      expect(parsed).toHaveProperty('body')
      expect(parsed.body).toHaveProperty('key', 'value')
    })
  })

  describe('parser:json5', () => {
    test('key:value', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.json5',
          content: json5
        }
      })

      expect(parsed).toHaveProperty('id')
      assert(parsed.id === 'content:index.json5')

      expect(parsed).toHaveProperty('body')
      expect(parsed.body).toHaveProperty('key', 'value')

      expect(parsed.body.leadingDecimalPoint).toEqual(0.8675309)
      expect(parsed.body.andTrailing).toEqual(8675309)
      expect(parsed.body.lineBreaks).toEqual("Look, Mom! No \n's!")
    })
  })
}
