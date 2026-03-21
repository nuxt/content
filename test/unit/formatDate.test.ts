import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime } from '../../src/runtime/internal/preview/utils'

describe('formatDate', () => {
  it('formats a date string as YYYY-MM-DD', () => {
    // formatDate uses local time (getFullYear/getMonth/getDate), so we
    // construct expected values the same way to stay timezone-agnostic.
    const input = '2022-06-15T12:00:00.000Z'
    const d = new Date(input)
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    expect(formatDate(input)).toBe(expected)
  })

  it('pads single-digit month and day', () => {
    const input = '2022-01-05T12:00:00.000Z'
    const result = formatDate(input)
    // Format is always YYYY-MM-DD with zero-padded segments
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result).toContain('-05')
  })

  it('handles end-of-year dates', () => {
    const input = '2022-12-31T12:00:00.000Z'
    const result = formatDate(input)
    expect(result).toMatch(/^\d{4}-12-31$/)
  })

  it('throws on invalid date', () => {
    expect(() => formatDate('not-a-date')).toThrow(TypeError)
    expect(() => formatDate('not-a-date')).toThrow('Invalid date value')
  })

  it('produces same output as the build-time copy', async () => {
    // Guard against the two copies drifting apart.
    const buildTime = await import('../../src/utils/content/transformers/utils')
    const inputs = ['2022-06-15T12:00:00.000Z', '2023-01-01T00:00:00.000Z', '2024-12-31T23:59:59.000Z']
    for (const input of inputs) {
      expect(formatDate(input)).toBe(buildTime.formatDate(input))
    }
  })
})

describe('formatDateTime', () => {
  it('formats a datetime string as YYYY-MM-DD HH:mm:ss', () => {
    const input = '2022-06-15T14:30:45.000Z'
    const result = formatDateTime(input)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
    // The date portion must match formatDate
    expect(result.split(' ')[0]).toBe(formatDate(input))
  })

  it('pads single-digit hours, minutes, and seconds', () => {
    const result = formatDateTime('2022-01-01T01:02:03.000Z')
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
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
