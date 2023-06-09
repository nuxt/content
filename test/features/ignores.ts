import { describe, test, expect } from 'vitest'
import { makeIgnored } from '../../src/runtime/utils/config'

function run (pattern: string, key: string, result: boolean) {
  const isIgnored = makeIgnored([pattern])
  expect(isIgnored(key)).toBe(result)
}

export const testIgnores = () => {
  describe('Ignores Options', () => {
    test('ignore any file or folder that contains the word "hidden"', () => {
      const key = 'source:content:my-hidden-folder:index.md'
      run('hidden', key, true)
    })

    test('ignore any file or folder prefixed with the word "hidden"', () => {
      const key = 'source:content:hidden-folder:index.md'
      run('/hidden', key, true)
    })

    test('ignore any folder that exactly matches the word "hidden"', () => {
      const key = 'source:content:hidden:index.md'
      run('/hidden/', key, true)
    })

    test('ignore any file path matching "/path/to/file"', () => {
      const key = 'source:content:path:to:file.md'
      run('/path/to/file', key, true)
    })

    test('ignore any file with the extension ".bak"', () => {
      const key = 'source:content:path:to:ignored.bak'
      run('\\.bak$', key, true)
    })

    test('ignore any file with a leading dash', () => {
      const key = 'source:content:path:to:-dash.txt'
      run('', key, true)
    })

    test('ignore any file with a leading dot', () => {
      const key = 'source:content:path:to:.dot.txt'
      run('', key, true)
    })
  })
}
