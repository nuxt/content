import fsp from 'fs/promises'
import { test, expect } from 'vitest'
import { join } from 'pathe'
import { renderPage, pullingForHMR, expectNoClientErrors, waitFor } from '../utils'

export const testHMR = async (fixturePath: string) => {
  await fsp.mkdir(join(fixturePath, 'content-tests'), { recursive: true })
  await fsp.writeFile(join(fixturePath, 'content-tests/index.md'), '# Hello')
  await fsp.writeFile(join(fixturePath, 'content-tests/foo(bar).md'), '# Foo Bar')
  await fsp.writeFile(join(fixturePath, 'content-tests/default-slot.md'), [
    '::FooSlot',
    'Initial value for default slot',
    '#foo',
    'Initial value for foo slot',
    '::'
  ].join('\n'))

  test('[HMR]: Should work', async () => {
    const { page, pageErrors, consoleLogs } = await renderPage('/_tests')

    expect(await page.$('h1').then(r => r.textContent())).toBe('Hello')

    await fsp.writeFile(join(fixturePath, 'content-tests/index.md'), '# Hello HMR')

    await pullingForHMR(async () => {
      expect(await page.$('h1').then(r => r.textContent())).toBe('Hello HMR')
    })

    // ensure no errors
    expectNoClientErrors(pageErrors, consoleLogs)

    await page.close()
  })

  test('[HMR]: File with parentheses', async () => {
    const { page, pageErrors, consoleLogs } = await renderPage('/_tests/foo(bar)')

    expect(await page.$('h1').then(r => r.textContent())).toBe('Foo Bar')

    await fsp.writeFile(join(fixturePath, 'content-tests/foo(bar).md'), '# Foo Bar Baz')

    await pullingForHMR(async () => {
      expect(await page.$('h1').then(r => r.textContent())).toBe('Foo Bar Baz')
    })

    // ensure no errors
    expectNoClientErrors(pageErrors, consoleLogs)

    await page.close()
  })

  test('[HMR]: Update slot', async () => {
    const { page, pageErrors, consoleLogs } = await renderPage('/_tests/default-slot')

    expect(await page.$('#default-slot').then(r => r.textContent())).toBe('Initial value for default slot')
    expect(await page.$('#foo-slot').then(r => r.textContent())).toBe('Initial value for foo slot')

    await fsp.writeFile(join(fixturePath, 'content-tests/default-slot.md'), [
      '::FooSlot',
      'Updated value for default slot',
      '#foo',
      'Updated value for foo slot',
      '::'
    ].join('\n'))
    await pullingForHMR(async () => {
      expect(await page.$('#default-slot').then(r => r.textContent())).toBe('Updated value for default slot')
      expect(await page.$('#foo-slot').then(r => r.textContent())).toBe('Updated value for foo slot')
    })

    // ensure no errors
    expectNoClientErrors(pageErrors, consoleLogs)

    await page.close()
  }, 0)
}
