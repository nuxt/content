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
  return d.toISOString().slice(0, 10)
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
