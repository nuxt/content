import { createDefu } from 'defu'
import type { CollectionSource } from '@nuxt/content'

export * from './files'

export const defu = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    obj[key] = value
    return true
  }
})

export const createSingleton = <T, Params extends Array<unknown>>(fn: () => T) => {
  let instance: T | undefined
  return (_args?: Params) => {
    if (!instance) {
      instance = fn()
    }
    return instance
  }
}

// https://github.com/nuxt/framework/blob/02df51dd577000082694423ea49e1c90737585af/packages/nuxt/src/app/config.ts#L12
export function deepDelete(obj: Record<string, unknown>, newObj: Record<string, unknown>) {
  for (const key in obj) {
    const val = newObj[key]
    if (!(key in newObj)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete obj[key]
    }

    if (val !== null && typeof val === 'object') {
      deepDelete(obj[key] as Record<string, unknown>, newObj[key] as Record<string, unknown>)
    }
  }
}

// https://github.com/nuxt/framework/blob/02df51dd577000082694423ea49e1c90737585af/packages/nuxt/src/app/config.ts#L25
export function deepAssign(obj: Record<string, unknown>, newObj: Record<string, unknown>) {
  for (const key in newObj) {
    const val = newObj[key]
    if (val === '_DELETED_') {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete obj[key]
      continue
    }

    if (val !== null && typeof val === 'object') {
      // Replace array types
      if (Array.isArray(val) && Array.isArray(obj[key])) {
        obj[key] = val
      }
      else {
        obj[key] = obj[key] || {}
        deepAssign(obj[key] as Record<string, unknown>, val as Record<string, unknown>)
      }
    }
    else {
      obj[key] = val
    }
  }
}

export function parseSourceBase(source: CollectionSource) {
  const [fixPart, ...rest] = source.include.includes('*') ? source.include.split('*') : ['', source.include]
  return {
    fixed: fixPart || '',
    dynamic: '*' + rest.join('*'),
  }
}

/**
 * Format a date value as `YYYY-MM-DD` for SQL DATE columns.
 *
 * Duplicated from `src/utils/content/transformers/utils.ts` because that
 * file lives outside the `runtime/` subtree and is not emitted to dist.
 * Importing it from the preview runtime causes a broken path in the
 * published package.
 *
 * Always uses UTC. Offset-less datetimes are treated as UTC.
 *
 * @see https://github.com/nuxt/content/issues/3742
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
 *
 * @see {@link formatDate} for why this is duplicated here.
 * @see https://github.com/nuxt/content/issues/3742
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
