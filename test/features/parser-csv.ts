import { describe, test, expect, assert } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

const csv = `a,b,c
1,2,3
4,5,6`

export const testCSVParser = () => {
  describe('parser:csv', () => {
    test('simple', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.csv',
          content: csv
        }
      })

      expect(parsed).toHaveProperty('_id')
      assert(parsed._id === 'content:index.csv')

      expect(parsed).toHaveProperty('body')
      expect(Array.isArray(parsed.body)).toBeTruthy()

      expect(parsed.body[0]).toMatchObject({ a: '1', b: '2', c: '3' })
      expect(parsed.body[1]).toMatchObject({ a: '4', b: '5', c: '6' })
    })
  })
}
