import { expect, describe, test } from 'vitest'

import { retrieveGitHash } from '../../../src/utils/git'

describe('retrieveGitHash', async () => {
  test('returns a valid git hash from a real repository', async () => {
    const url = 'https://github.com/nuxt/content'

    // returns the hash from the remote `HEAD`
    const hash = await retrieveGitHash(url)
    expect(hash).toBeTypeOf('string')
  })
})
