import defu, { createDefu } from 'defu'

/**
 * Custom defu that merges arrays by index (item-by-item) instead of concatenating.
 * Used for inline i18n expansion: locale overrides merge with default locale items
 * so untranslated fields (routes, IDs, progress) are preserved from the default.
 */
export const defuByIndex = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    const base = obj[key]
    obj[key] = value.map((item, i) =>
      i < base.length && typeof item === 'object' && item !== null && typeof base[i] === 'object' && base[i] !== null
        ? defu(item, base[i])
        : item,
    )
    if (base.length > value.length) {
      obj[key].push(...base.slice(value.length))
    }
    return true
  }
})
