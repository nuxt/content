import { fromByteArray, toByteArray } from 'base64-js'

/**
 * Encode params object to base64 string
 */
export function encodeApiParams (params: any = {}) {
  // encode URI component to prevent malformed Characters in JSON
  params = encodeURIComponent(jsonStringify(params))

  // Convert to byte array
  params = new Uint8Array(params.length).map((_, i) => params[i].charCodeAt(0))

  return fromByteArray(params)
    .replace(/\+/g, '.').replace(/\//g, '-') // Replace special characters to prevent creating malformed URL
}

/**
 * Decode params base64 string back to object
 */
export function decodeApiParams <T> (params: string = ''): T {
  // Remove possible extension
  params = params.endsWith('.json') ? params.slice(0, -5) : params

  // Fix Base64 format
  params = params.replace(/\./g, '+').replace(/-/g, '/')

  // Decode data
  params = String.fromCharCode(...toByteArray(params))

  return params ? jsonParse(decodeURIComponent(params)) : {}
}

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
function regExpReviver (_key, value) {
  const withOperator = (typeof value === 'string' && value.match(/^---(\W+) (.+)$/)) || []

  if (withOperator[1] === 'REGEX') {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags
    const regex = withOperator[2].match(/\/(.*)\/([dgimsuy]*)$/)
    return regex ? new RegExp(regex[1], regex[2] || '') : value
  }

  return value
}
