import type { ContentTransformer } from '../../../types/content'

export const defineTransformer = (transformer: ContentTransformer) => {
  return transformer
}

/**
 * Format a date value as `YYYY-MM-DD` for SQL DATE columns.
 *
 * Always uses UTC. Offset-less datetimes are treated as UTC.
 */
export const formatDate = (date: string | Date): string => {
  const d = toUtcDate(date)
  if (Number.isNaN(d.getTime())) {
    throw new TypeError(`Invalid date value: "${date}"`)
  }
  return d.toISOString().slice(0, 10)
}

/**
 * Format a datetime value as `YYYY-MM-DD HH:mm:ss` for SQL DATETIME columns.
 *
 * Always uses UTC. Offset-less datetimes are treated as UTC.
 */
export const formatDateTime = (datetime: string | Date): string => {
  const d = toUtcDate(datetime)
  if (Number.isNaN(d.getTime())) {
    throw new TypeError(`Invalid datetime value: "${datetime}"`)
  }
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

/** Match structured date/datetime inputs we can validate as civil UTC components. */
const STRUCTURED = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/i

/**
 * Parse as UTC. Offset-less values are treated as UTC.
 * Impossible civil dates (e.g. `2024-02-31`) are rejected via Date.UTC round-trip.
 */
function toUtcDate(value: string | Date): Date {
  if (value instanceof Date) {
    return value
  }

  const input = String(value).trim()
  const match = STRUCTURED.exec(input)
  if (!match) {
    return new Date(input)
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4] || 0)
  const minute = Number(match[5] || 0)
  const second = Number(match[6] || 0)
  const offset = match[7]

  // Round-trip through Date.UTC so Feb 31 / hour 25 stay invalid
  const utc = new Date(Date.UTC(year, month - 1, day, hour, minute, second))
  if (
    utc.getUTCFullYear() !== year
    || utc.getUTCMonth() + 1 !== month
    || utc.getUTCDate() !== day
    || utc.getUTCHours() !== hour
    || utc.getUTCMinutes() !== minute
    || utc.getUTCSeconds() !== second
  ) {
    return new Date(Number.NaN)
  }

  // Explicit offset → absolute instant (civil parts already validated)
  if (offset && offset.toUpperCase() !== 'Z') {
    return new Date(input.includes('T') ? input : input.replace(' ', 'T'))
  }

  return utc
}
