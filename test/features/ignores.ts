import { describe, test, expect } from 'vitest'
import { makeIgnored } from '../../src/runtime/utils/config'

function run (key: string, pattern: string, result: boolean, experimental: boolean) {
  const predicate = makeIgnored([pattern], experimental)
  const label: string = experimental ? 'new format' : 'old format'
  test(label, () => {
    expect(predicate(key)).toBe(result)
  })
}

function runOld (pattern: string, key: string, result: boolean) {
  return run(key, pattern, result, false)
}

function runNew (pattern: string, key: string, result: boolean) {
  return run(key, pattern, result, true)
}

export const testIgnores = () => {
  describe('Ignores Options', () => {
    describe('any file or folder that contains the word "hidden"', () => {
      const key = 'source:content:my-hidden-folder:index.md'
      runOld('.+hidden', key, true)
      runNew('hidden', key, true)
    })

    describe('any file or folder prefixed with the word "hidden"', () => {
      const key = 'source:content:hidden-folder:index.md'
      runOld('hidden', key, true)
      runNew('/hidden', key, true)
    })

    describe('any folder that exactly matches the word "hidden"', () => {
      const key = 'source:content:hidden:index.md'
      runOld('hidden:', key, true)
      runNew('/hidden/', key, true)
    })

    describe('any file path matching "/path/to/file"', () => {
      const key = 'source:content:path:to:file.md'
      runOld('path:to:file', key, true)
      runNew('/path/to/file', key, true)
    })

    describe('any file with the extension ".bak"', () => {
      const key = 'source:content:path:to:ignored.bak'
      runOld('.+\\.bak$', key, true)
      runNew('\\.bak$', key, true)
    })

    describe('any file with a leading dash', () => {
      const key = 'source:content:path:to:-dash.txt'
      runOld('', key, true)
      runNew('', key, true)
    })

    describe('any file with a leading dot', () => {
      const key = 'source:content:path:to:.dot.txt'
      runOld('', key, true)
      runNew('', key, true)
    })
  })
}
