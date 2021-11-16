/**
 * Temporarily inline https://github.com/unjs/scule
 * as we are having problems with Nitro / Webpack bundling of that package.
 */

export function isUppercase(char: string = '') {
  return char.toUpperCase() === char
}

const STR_SPLITTERS = ['-', '_', '/', '.']

export function splitByCase(str: string, splitters = STR_SPLITTERS): string[] {
  const parts: string[] = []

  if (!str || typeof str !== 'string') {
    return parts
  }

  let buff: string = ''

  let previusUpper = null
  let previousSplitter = null

  for (const char of str.split('')) {
    // Splitter
    const isSplitter = splitters.includes(char)
    if (isSplitter === true) {
      parts.push(buff)
      buff = ''
      previusUpper = null
      continue
    }

    const isUpper = isUppercase(char)
    if (previousSplitter === false) {
      // Case rising edge
      if (previusUpper === false && isUpper === true) {
        parts.push(buff)
        buff = char
        previusUpper = isUpper
        continue
      }
      // Case falling edge
      if (previusUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff[buff.length - 1]
        parts.push(buff.substr(0, buff.length - 1))
        buff = lastChar + char
        previusUpper = isUpper
        continue
      }
    }

    // Normal char
    buff += char
    previusUpper = isUpper
    previousSplitter = isSplitter
  }

  parts.push(buff)

  return parts
}

export function upperFirst(str: string): string {
  if (!str) {
    return ''
  }
  return str[0].toUpperCase() + str.substr(1)
}

export function lowerFirst(str: string): string {
  if (!str) {
    return ''
  }
  return str[0].toLocaleLowerCase() + str.substr(1)
}

export function pascalCase(str: string | string[] = ''): string {
  return (Array.isArray(str) ? str : splitByCase(str)).map(p => upperFirst(p)).join('')
}

export function camelCase(str: string | string[] = ''): string {
  return lowerFirst(pascalCase(str))
}

export function kebabCase(str: string | string[] = '', joiner = '-'): string {
  return (Array.isArray(str) ? str : splitByCase(str)).map((p = '') => p.toLocaleLowerCase()).join(joiner)
}

export function snakeCase(str: string | string[] = '') {
  return kebabCase(str, '_')
}
