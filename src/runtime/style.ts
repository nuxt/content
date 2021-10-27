import type { MetaInfo } from 'vue-meta'
import type { Context } from '@nuxt/types'
import type { Colors } from 'types'
import { getColors } from './theme-colors'
import { useTheme } from './'
import { computed } from '#app'

let _head: any

/**
 * Parse color definition from Docus Config.
 */
function useColors(colors: Colors) {
  try {
    return Object.entries(colors).map(([key, color]) => [key, typeof color === 'string' ? getColors(color) : color])
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.warn('Could not parse custom colors:', e && e.message ? e.message : e)

    return []
  }
}

/**
 * Create a css variable store.
 */
function useCssVariableStore(scopes = ['dark']) {
  scopes = ['default', ...scopes]

  const _store = scopes.reduce((obj, scope) => ({ [scope]: {}, ...obj }), {} as any)

  const getScope = (scope: string) => _store[scope] || null

  const putSingle = (key: string) => (value: string) => {
    const _arr = value.split(':')
    const _value = _arr.pop()
    const _scope = getScope(_arr.pop() || 'default')
    if (_scope) {
      _scope[key] = _value
    }
  }

  const put = (key: string, value: string) => {
    value.split(' ').map(putSingle(key))
  }

  const generateVar = ([key, value]: [string, any]) => `--${key}: ${value}`

  const generateScope = (scope: string) => {
    const vars = Object.entries(getScope(scope)).map(generateVar).join(';')
    return scope === 'default' ? `html:root {${vars}}` : `html.${scope} {${vars}}`
  }

  const generate = () => scopes.map(generateScope).join(' ')

  return { put, generate }
}

/**
 * Generate a css string from variables definition.
 */
function useCSSVariables(colors: Colors) {
  const { put, generate } = useCssVariableStore(['dark'])

  const colorsList = useColors(colors)

  colorsList.forEach(([color, map]) =>
    Object.entries(map).forEach(([variant, value]) => put(`${color}-${variant}`, value as string))
  )

  return generate()
}

function updateHead() {
  const head: MetaInfo = typeof _head === 'function' ? _head() : _head!

  // Init head if absent
  if (!Array.isArray(head.style)) {
    head.style = []
  }

  // Init meta is absent
  if (!Array.isArray(head.meta)) {
    head.meta = []
  }

  // Push CSS variables
  head.style.push({
    hid: 'docus-theme',
    cssText: styles.value,
    type: 'text/css'
  })

  head.meta = head.meta.filter(s => s.hid !== 'theme-color')
}

const styles = computed(() => {
  const theme = useTheme()

  return useCSSVariables(theme.value?.colors ? theme.value.colors : {})
})

export const createDocusStyles = (context: Context) => {
  const { app } = context

  // Proxy app.head()
  _head = app.head

  // Update head
  updateHead()
}

/**
 * Access the styling state and helpers.
 */
export const useStyles = () => {
  return {
    styles,
    updateHead
  }
}
