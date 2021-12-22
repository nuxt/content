import { assert, test } from 'vitest'

test('Basic test', () => {
  assert.equal(1, 1)
})

test('Basic async test', async () => {
  assert.equal(1, 1)

  await new Promise(resolve => setTimeout(resolve, 1000))

  assert.equal(1, 1)
})
