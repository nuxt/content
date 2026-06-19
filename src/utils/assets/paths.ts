import { extname } from 'pathe'
import { getAssetExtensions } from './state'

const ORDERING_RE = /^\d+\./

// Strip ordering prefixes (`1.`, `01.`) from every segment. Copy and resolution
// both apply it so URLs and references agree. File names are kept verbatim.
export function removeOrdering(path: string): string {
  return path.split('/').map(segment => segment.replace(ORDERING_RE, '')).join('/')
}

export function parseQuery(path: string): string {
  return path.match(/\?.+$/)?.[0] || ''
}

export function removeQuery(path: string): string {
  return path.replace(/\?.*$/, '')
}

export function getExtension(path: string): string {
  return extname(removeQuery(path)).substring(1).toLowerCase()
}

export function isAssetExtension(path: string): boolean {
  return getAssetExtensions().includes(getExtension(path))
}

export function isRelative(path: string): boolean {
  return !/^(?:\/|#|[a-z][a-z0-9+.-]*:)/i.test(path)
}

export function isRelativeAsset(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && isRelative(value) && isAssetExtension(value)
}

export function buildStyle(...expressions: string[]): string {
  return expressions
    .map(expression => expression.replace(/^[; ]+|[; ]+$/g, ''))
    .filter(Boolean)
    .join('; ')
    .replace(/\s*;\s*/g, '; ') + ';'
}

// Merge a leading path with `key=value` params into a single query string.
export function buildQuery(...expressions: string[]): string {
  const parts = expressions
    .map(expression => expression.replace(/^[?&]+|&+$/g, ''))
    .filter(Boolean)
  if (!parts.length) {
    return ''
  }
  const [first, ...rest] = parts
  const isParam = (expression: string) => /^[^?]+=[^=]+$/.test(expression)
  if (isParam(first!)) {
    return '?' + parts.join('&')
  }
  return rest.length ? first + (first!.includes('?') ? '&' : '?') + rest.join('&') : first!
}
