import { resolve } from 'path'
import { withDocus } from '@docus/app'

describe('module', () => {
  const docus = withDocus(resolve(__dirname, './fixtures/theme.js'), {})

  test('withDocus should return NuxtConfig', () => {
    expect(docus).toBeInstanceOf(Object)
  })

  test('withDocus should return NuxtConfig extending theme', () => {
    expect(docus).toBeInstanceOf(Object)
    expect(docus).toHaveProperty('themeDir')
    expect(docus.themeDir).toEqual(resolve(__dirname, './fixtures'))
  })
})
