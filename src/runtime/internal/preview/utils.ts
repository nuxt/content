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
 * Format a date string as `YYYY-MM-DD` for SQL DATE columns.
 *
 * Duplicated from `src/utils/content/transformers/utils.ts` because that
 * file lives outside the `runtime/` subtree and is not emitted to dist.
 * Importing it from the preview runtime causes a broken path in the
 * published package.
 *
 * @see https://github.com/nuxt/content/issues/3742
 */
export const formatDate = (date: string): string => {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) {
    throw new TypeError(`Invalid date value: "${date}"`)
  }

  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()

  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

/**
 * Format a date string as `YYYY-MM-DD HH:mm:ss` for SQL DATETIME columns.
 *
 * @see {@link formatDate} for why this is duplicated here.
 * @see https://github.com/nuxt/content/issues/3742
 */
export const formatDateTime = (datetime: string): string => {
  const d = new Date(datetime)
  if (Number.isNaN(d.getTime())) {
    throw new TypeError(`Invalid datetime value: "${datetime}"`)
  }

  const hours = d.getHours()
  const minutes = d.getMinutes()
  const seconds = d.getSeconds()

  return `${formatDate(datetime)} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
