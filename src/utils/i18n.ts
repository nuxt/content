import { createDefu } from 'defu'

/**
 * Custom defu that merges arrays by index (item-by-item) instead of concatenating.
 * Applied recursively to all nested arrays within merged objects.
 * Used for inline i18n expansion: locale overrides merge with default locale items
 * so untranslated fields (routes, IDs, icons, URLs) are preserved from the default.
 *
 * In createDefu's merger: obj[key] = accumulated result (has defaults), value = override.
 * Override items take priority; default items fill gaps for missing fields.
 */
export const defuByIndex = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    const defaultArr = obj[key]
    const overrideArr = value
    const maxLen = Math.max(overrideArr.length, defaultArr.length)
    const result = []
    for (let i = 0; i < maxLen; i++) {
      const overrideItem = overrideArr[i]
      const defaultItem = defaultArr[i]
      if (overrideItem !== undefined && defaultItem !== undefined
        && typeof overrideItem === 'object' && overrideItem !== null
        && typeof defaultItem === 'object' && defaultItem !== null) {
        // Recursively merge with defuByIndex so nested arrays also merge by index
        result.push(defuByIndex(overrideItem, defaultItem))
      }
      else {
        result.push(overrideItem !== undefined ? overrideItem : defaultItem)
      }
    }
    obj[key] = result
    return true
  }
})
