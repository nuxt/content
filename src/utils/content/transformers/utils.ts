import type { ContentTransformer } from '../../../types/content'

export const defineTransformer = (transformer: ContentTransformer) => {
  return transformer
}

/**
 * Format a date value as `YYYY-MM-DD` for SQL DATE columns.
 *
 * Always uses UTC. Offset-less datetimes (e.g. `2023-01-01T00:00:00`,
 * `2023-01-01 00:00:00`) are treated as UTC rather than local time.
 */
export const formatDate = (date: string | Date): string => {
  const d = toUtcDate(date)
  if (Number.isNaN(d.getTime())) {
    throw new TypeError(`Invalid date value: "${date}"`)
  }

  const year = d.getUTCFullYear()
  const month = d.getUTCMonth() + 1
  const day = d.getUTCDate()

  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
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

  const year = d.getUTCFullYear()
  const month = d.getUTCMonth() + 1
  const day = d.getUTCDate()
  const hours = d.getUTCHours()
  const minutes = d.getUTCMinutes()
  const seconds = d.getUTCSeconds()

  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Parse a date/datetime value as UTC.
 *
 * - Date objects are used as-is
 * - Space-separated datetimes (`YYYY-MM-DD HH:mm:ss[.sss]`) become ISO + Z
 * - Offset-less ISO datetimes (`YYYY-MM-DDTHH:mm:ss[.sss]`) get a Z suffix
 * - Date-only (`YYYY-MM-DD`) and values that already include Z/offset pass through
 */
function toUtcDate(value: string | Date): Date {
  if (value instanceof Date) {
    return value
  }

  const input = String(value).trim()

  // Already has an explicit offset or Z — Date parses correctly as absolute time
  if (/(?:z|[+-]\d{2}:?\d{2})$/i.test(input)) {
    return new Date(input)
  }

  // Space-separated SQL-style datetime → ISO + Z
  const spaceSeparated = input.replace(
    /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})(\.\d+)?$/,
    '$1T$2$3Z',
  )
  if (spaceSeparated !== input) {
    return new Date(spaceSeparated)
  }

  // Offset-less ISO datetime (`2023-01-01T00:00:00`) → treat as UTC
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(input)) {
    return new Date(`${input}Z`)
  }

  // Date-only and everything else — Date-only is already UTC midnight per ES
  return new Date(input)
}
