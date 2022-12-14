/**
 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
 * This function is equivalent to `JSON.stringify`, but it also handles RegExp objects.
 */
export function jsonStringify (value: any) {
  return JSON.stringify(value, regExpReplacer)
}

/**
 * Converts a JavaScript Object Notation (JSON) string into an object.
 * This function is equivalent to `JSON.parse`, but it also handles RegExp objects.
 */
export function jsonParse (value: string) {
  return JSON.parse(value, regExpReviver)
}

/**
 * A function that transforms RegExp objects to their string representation.
 */
function regExpReplacer (_key: string, value: any) {
  if (value instanceof RegExp) {
    return `--REGEX ${value.toString()}`
  }
  return value
}

/**
 * A function that transforms RegExp string representation back to RegExp objects.
 */
function regExpReviver (_key: string, value: any) {
  const withOperator = (typeof value === 'string' && value.match(/^--([A-Z]+) (.+)$/)) || []

  if (withOperator[1] === 'REGEX') {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags
    const regex = withOperator[2].match(/\/(.*)\/([dgimsuy]*)$/)
    return regex ? new RegExp(regex[1], regex[2] || '') : value
  }

  return value
}
