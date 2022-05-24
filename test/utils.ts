import { getBrowser, url, useTestContext } from '@nuxt/test-utils'
import type { Browser } from 'playwright'
import { expect } from 'vitest'

let browser: Browser = null
export async function renderPage (path) {
  const ctx = useTestContext()
  if (!ctx.options.browser) {
    return
  }

  browser = browser || await getBrowser()
  const page = await browser.newPage({})
  const pageErrors = []
  const consoleLogs = []

  page.on('console', (message) => {
    consoleLogs.push({
      type: message.type(),
      text: message.text()
    })
  })
  page.on('pageerror', (err) => {
    pageErrors.push(err)
  })

  if (path) {
    await page.goto(url(path))
  }

  return {
    page,
    pageErrors,
    consoleLogs
  }
}

export function waitFor (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function expectNoClientErrors (pageErrors: any[], consoleLogs: any[]) {
  const consoleLogErrors = consoleLogs.filter(i => i.type === 'error')
  const consoleLogWarnings = consoleLogs.filter(i => i.type === 'warn')

  expect(pageErrors).toEqual([])
  expect(consoleLogErrors).toEqual([])
  expect(consoleLogWarnings).toEqual([])
}

export async function pullingForHMR (check: () => Promise<void> | void, retries = 100, delay = 500) {
  try {
    return await check()
  } catch (e) {
    if (retries <= 0) {
      throw e
    }
    await new Promise(resolve => setTimeout(resolve, delay))
    return pullingForHMR(check, retries - 1, delay)
  }
}
