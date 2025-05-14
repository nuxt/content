import { describe, it, expect } from 'vitest'
import { decompressSQLDump } from '../../src/runtime/internal/dump'

describe('decompressSQLDump', () => {
  it.skip('should decompress a gzip compressed base64 string', async () => {
    // This is a gzip compressed base64 string containing "hello world"
    const compressed = 'H4sIAAAAAAAAA8tIzcnJVyjPL8pJAQCFEUoNCwAAAA=='

    const result = await decompressSQLDump(compressed)

    expect(result).toEqual(['hello world'])
  })

  it('should handle empty input', async () => {
    const emptyString = ''

    await expect(decompressSQLDump(emptyString))
      .rejects.toThrow()
  })

  it('should throw error on invalid base64 input', async () => {
    const invalidBase64 = 'invalid-base64!'

    await expect(decompressSQLDump(invalidBase64))
      .rejects.toThrow()
  })

  it('should throw error on invalid compression format', async () => {
    const compressed = 'H4sIAAAAAAAAA8tIzcnJVyjPL8pJAQCFEUoNCwAAAA=='

    // @ts-expect-error Testing invalid compression type
    await expect(decompressSQLDump(compressed, 'invalid-format'))
      .rejects.toThrow()
  })
})
