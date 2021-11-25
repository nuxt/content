import {
  build,
  createBrowser,
  createContext,
  generate,
  getContext,
  loadFixture,
  loadNuxt,
  setContext
  // spyOnClass
} from '@nuxt/test-utils'
import type { NuxtTestOptions } from '@nuxt/test-utils'
import getPort from 'get-port'

async function listen() {
  const ctx = getContext()
  const { server } = ctx.options.config
  const port = await getPort({
    ...((server == null ? undefined : server.port) && { port: Number(server == null ? undefined : server.port) })
  })
  ctx.url = 'http://localhost:' + port
  await (ctx.nuxt as any).server.listen(port)
}

export function setupTest(options: Partial<NuxtTestOptions>) {
  // @ts-ignore - Set LOCAL_IMPORT env variable for testing with debug-theme
  process.env.LOCAL_IMPORT = true

  const ctx = createContext(options)

  beforeEach(() => {
    setContext(ctx)
  })

  afterEach(() => {
    setContext(undefined as any)
  })

  // @ts-ignore
  after(async () => {
    // close browser before nuxt server
    if (ctx.browser) {
      await ctx.browser.close()
    }

    if (ctx.nuxt) {
      await ctx.nuxt.close()
    }
  })

  it('setup nuxt', async function () {
    // @ts-ignore
    this.timeout(ctx.options.waitFor)

    if (ctx.options.fixture) {
      await loadFixture()
    }

    if (!ctx.nuxt) {
      await loadNuxt()
      // TODO: spyOnClass
      // spyOnClass(ctx.nuxt.moduleContainer)
      await ctx.nuxt!.ready()
    }

    if (ctx.options.build) {
      await build()
    }

    if (ctx.options.server) {
      await listen()
    }

    if (ctx.options.generate) {
      await generate()
    }

    if (ctx.options.waitFor) {
      await new Promise(resolve => setTimeout(resolve, ctx.options.waitFor))
    }

    if (ctx.options.browser) {
      await createBrowser()
    }
  })
}
