import fsp from 'fs/promises'
import { test, expect } from 'vitest'
import { join } from 'pathe'
import { url } from '@nuxt/test-utils'
import { renderPage, pullingForHMR, expectNoClientErrors } from '../utils'

export const testHMR = async (fixturePath: string) => {
  await fsp.mkdir(join(fixturePath, 'content-tests'), { recursive: true })
  await fsp.writeFile(join(fixturePath, 'content-tests/1.index.md'), '# Hello')
  await fsp.writeFile(join(fixturePath, 'content-tests/2.foo(bar).md'), '# Foo Bar')
  await fsp.writeFile(join(fixturePath, 'content-tests/3.default-slot.md'), [
    '::FooSlot',
    'Initial value for default slot',
    '#foo',
    'Initial value for foo slot',
    '::'
  ].join('\n'))

  let renderer

  test('[HMR]: Should work', async () => {
    renderer = await renderPage('/_tests')
    expect(await renderer.page.$('h1').then(r => r.textContent())).toBe('Hello')

    await fsp.writeFile(join(fixturePath, 'content-tests/1.index.md'), '# Hello HMR')

    await pullingForHMR(async () => {
      expect(await renderer.page.$('h1').then(r => r.textContent())).toBe('Hello HMR')
    })

    // ensure no errors
    expectNoClientErrors(renderer.pageErrors, renderer.consoleLogs)
  })

  test('[HMR]: File with parentheses', async () => {
    await renderer.page.goto(url('/_tests/foo(bar)'))

    expect(await renderer.page.$('h1').then(r => r.textContent())).toBe('Foo Bar')

    await fsp.writeFile(join(fixturePath, 'content-tests/2.foo(bar).md'), '# Foo Bar Baz')

    await pullingForHMR(async () => {
      expect(await renderer.page.$('h1').then(r => r.textContent())).toBe('Foo Bar Baz')
    })

    // ensure no errors
    expectNoClientErrors(renderer.pageErrors, renderer.consoleLogs)
  })

  test('[HMR]: Update slot', async () => {
    await renderer.page.goto(url('/_tests/default-slot'))

    expect(await renderer.page.$('#default-slot').then(r => r.textContent())).toBe('Initial value for default slot')
    expect(await renderer.page.$('#foo-slot').then(r => r.textContent())).toBe('Initial value for foo slot')

    await fsp.writeFile(join(fixturePath, 'content-tests/3.default-slot.md'), [
      '::FooSlot',
      'Updated value for default slot',
      '#foo',
      'Updated value for foo slot',
      '::'
    ].join('\n'))
    await pullingForHMR(async () => {
      expect(await renderer.page.$('#default-slot').then(r => r.textContent())).toBe('Updated value for default slot')
      expect(await renderer.page.$('#foo-slot').then(r => r.textContent())).toBe('Updated value for foo slot')
    })

    // ensure no errors
    expectNoClientErrors(renderer.pageErrors, renderer.consoleLogs)
  })
}
