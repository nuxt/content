import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime } from '../../src/runtime/internal/preview/utils'

describe('formatDate', () => {
  it('formats an ISO date string as YYYY-MM-DD using UTC', () => {
    expect(formatDate('2022-06-15T12:00:00.000Z')).toBe('2022-06-15')
  })

  it('returns canonical date strings unchanged', () => {
    expect(formatDate('2022-06-15')).toBe('2022-06-15')
    expect(formatDate('2024-01-01')).toBe('2024-01-01')
  })

  it('pads single-digit month and day', () => {
    expect(formatDate('2022-01-05T00:00:00.000Z')).toBe('2022-01-05')
  })

  it('handles end-of-year dates consistently in UTC', () => {
    // 2022-12-31T23:00:00Z is still Dec 31 in UTC even if it's Jan 1 locally
    expect(formatDate('2022-12-31T23:00:00.000Z')).toBe('2022-12-31')
  })

  it('handles dates near midnight boundary in UTC', () => {
    // This is Jan 1 00:30 UTC — should be 2023-01-01, not 2022-12-31
    expect(formatDate('2023-01-01T00:30:00.000Z')).toBe('2023-01-01')
  })

  it('parses space-separated datetime as UTC', () => {
    expect(formatDate('2022-06-15 14:30:00')).toBe('2022-06-15')
  })

  it('handles Date object input', () => {
    expect(formatDate(new Date('2022-06-15T14:30:00.000Z'))).toBe('2022-06-15')
  })

  it('throws on invalid date', () => {
    expect(() => formatDate('not-a-date')).toThrow(TypeError)
    expect(() => formatDate('not-a-date')).toThrow('Invalid date value')
  })

  it('produces same output as the build-time copy', async () => {
    const buildTime = await import('../../src/utils/content/transformers/utils')
    const inputs = ['2022-06-15T12:00:00.000Z', '2023-01-01T00:00:00.000Z', '2024-12-31T23:59:59.000Z']
    for (const input of inputs) {
      expect(formatDate(input)).toBe(buildTime.formatDate(input))
    }
  })
})

describe('formatDateTime', () => {
  it('formats an ISO datetime string as YYYY-MM-DD HH:mm:ss using UTC', () => {
    expect(formatDateTime('2022-06-15T14:30:45.000Z')).toBe('2022-06-15 14:30:45')
  })

  it('returns canonical datetime strings unchanged', () => {
    expect(formatDateTime('2022-06-15 14:30:45')).toBe('2022-06-15 14:30:45')
  })

  it('pads single-digit hours, minutes, and seconds', () => {
    expect(formatDateTime('2022-01-01T01:02:03.000Z')).toBe('2022-01-01 01:02:03')
  })

  it('uses UTC time components regardless of system timezone', () => {
    // Midnight UTC should always produce 00:00:00
    expect(formatDateTime('2022-06-15T00:00:00.000Z')).toBe('2022-06-15 00:00:00')
    // 23:59:59 UTC should always produce that time, not shift to next day
    expect(formatDateTime('2022-12-31T23:59:59.000Z')).toBe('2022-12-31 23:59:59')
  })

  it('the date portion matches formatDate output', () => {
    const input = '2022-06-15T14:30:45.000Z'
    const result = formatDateTime(input)
    expect(result.split(' ')[0]).toBe(formatDate(input))
  })

  it('throws on invalid datetime', () => {
    expect(() => formatDateTime('garbage')).toThrow(TypeError)
    expect(() => formatDateTime('garbage')).toThrow('Invalid datetime value')
  })

  it('produces same output as the build-time copy', async () => {
    const buildTime = await import('../../src/utils/content/transformers/utils')
    const inputs = ['2022-06-15T14:30:45.000Z', '2023-01-01T00:00:00.000Z']
    for (const input of inputs) {
      expect(formatDateTime(input)).toBe(buildTime.formatDateTime(input))
    }
  })
})
