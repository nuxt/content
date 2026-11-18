import { describe, expect, test, vi } from 'vitest'
import { runWithNuxtContext } from '@nuxt/kit'
import type { Nuxt, NuxtOptions } from '@nuxt/schema'
import { createApp, createRouter as createH3Router, eventHandler, toWebHandler } from 'h3'
import type { EventHandler } from 'h3'
import { addRoute, createRouter as createRou3Router, findRoute } from 'rou3'
import llmsModule from '../../src/features/llms/module'

vi.mock('@nuxt/kit', async (importOriginal) => {
  const original = await importOriginal<typeof import('@nuxt/kit')>()
  return {
    ...original,
    defineNuxtModule: (definition: unknown) => definition,
    addNitroPlugin: vi.fn(),
    addTypeTemplate: vi.fn(() => ({ dst: '' })),
  }
})

vi.mock('../../src/features/llms/runtime/server/raw-markdown', () => ({
  getRawMarkdown: async (_event: unknown, slug: string | undefined) => slug,
}))

vi.mock('nitropack/runtime', () => ({
  useRuntimeConfig: () => ({ llms: {} }),
}))

vi.mock('nuxt/server', () => ({
  createError: (input: object) => Object.assign(new Error('Page not found'), input),
  defineEventHandler: (handler: unknown) => handler,
  getRouterParams: (event: { context: { params: Record<string, string> } }) => event.context.params,
  useRuntimeConfig: () => ({ llms: {} }),
}))

const urls = {
  '/raw/index.md': 'index.md',
  '/raw/getting-started.md': 'getting-started.md',
  '/raw/en/docs/getting-started.md': 'en/docs/getting-started.md',
  '/raw/en/docs/getting-started': 'en/docs/getting-started',
}

async function getServerHandlers(nitroMajor: 2 | 3) {
  const nuxt = {
    options: { _nitroMajor: nitroMajor, serverHandlers: [], llms: {}, runtimeConfig: {}, nitro: {} },
  } as unknown as Nuxt
  await runWithNuxtContext(nuxt, () => (llmsModule as unknown as { setup: (options: object, nuxt: Nuxt) => void }).setup({}, nuxt))
  return Promise.all(nuxt.options.serverHandlers.map(async (handler: NuxtOptions['serverHandlers'][number]) => ({
    ...handler,
    handler: (await import(handler.handler)).default,
  })))
}

describe('llms raw markdown route', () => {
  test('passes the page path to the handler on Nitro 2', async () => {
    const router = createH3Router()
    for (const { route, handler, method } of await getServerHandlers(2)) {
      router.use(route!, handler as EventHandler, method as 'get')
    }
    router.use('/**', eventHandler(() => 'renderer'))
    const fetch = toWebHandler(createApp().use(router))

    for (const [url, slug] of Object.entries(urls)) {
      expect(await (await fetch(new Request(`http://localhost${url}`))).text()).toBe(slug)
    }
    expect(await (await fetch(new Request('http://localhost/raw'))).text()).toBe('renderer')
  })

  test('passes the page path to the handler on Nitro 3', async () => {
    const router = createRou3Router<(params?: Record<string, string>) => unknown>()
    for (const { route, handler, method } of await getServerHandlers(3)) {
      addRoute(router, method, route!, params => handler({ context: { params }, res: { headers: new Headers() } }))
    }
    addRoute(router, 'GET', '/**', () => 'renderer')
    const fetch = (url: string) => {
      const match = findRoute(router, 'GET', url)
      return match?.data(match.params)
    }

    for (const [url, slug] of Object.entries(urls)) {
      expect(await fetch(url)).toBe(slug)
    }
    expect(await fetch('/raw')).toBe('renderer')
  })
})
