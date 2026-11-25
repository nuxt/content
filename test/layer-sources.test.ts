import { spawn, type ChildProcess } from 'node:child_process'
import { cpSync, existsSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { afterAll, beforeAll, describe, it, expect } from 'vitest'
import { setup, useTestContext } from '@nuxt/test-utils/e2e'

// A copy, since its `content/` is deleted once prerendering is done: a deployed server doesn't ship it.
// At the fixture's depth, so its relative imports still resolve.
const fixture = fileURLToPath(new URL('./fixtures/layer-sources', import.meta.url))
const rootDir = fileURLToPath(new URL('./.tmp/layer-sources', import.meta.url))
rmSync(rootDir, { recursive: true, force: true })
cpSync(fixture, rootDir, { recursive: true, filter: path => !/[\\/](?:\.nuxt|\.output|\.vercel|node_modules)$/.test(path) })

describe('sources provided by a layer', async () => {
  await setup({
    rootDir,
    // Started below as Vercel runs it: only the function, without the static files.
    server: false,
    nuxtConfig: {
      hooks: {
        'nitro:init'(nitro) {
          nitro.hooks.hook('prerender:done', () => rmSync(join(rootDir, 'content'), { recursive: true, force: true }))
        },
      },
    },
  })

  let fn: ChildProcess
  let url: string

  beforeAll(async () => {
    const entry = join(useTestContext().nuxt!.options.nitro.output!.dir!, 'functions/__fallback.func/index.mjs')
    fn = spawn(process.execPath, ['--input-type=module', '-e', `
      import { createServer } from 'node:http'
      const { default: handler } = await import(${JSON.stringify(pathToFileURL(entry).href)})
      const server = createServer(handler).listen(0, () => console.log('port=' + server.address().port))
    `])
    const port = await new Promise<string>((resolve, reject) => {
      fn.stdout!.on('data', (data) => {
        const match = String(data).match(/port=(\d+)/)
        if (match) resolve(match[1]!)
      })
      fn.once('exit', code => reject(new Error(`The Vercel function exited with code ${code}`)))
    })
    url = `http://localhost:${port}`
  })

  afterAll(() => {
    fn?.kill()
    rmSync(rootDir, { recursive: true, force: true })
  })

  // The function evaluates the layer's `server/content.ts` again, without `content/`.
  it('serves the layer\'s sources from the deployed function', { timeout: 20_000 }, async () => {
    const paths = await fetch(`${url}/api/sources`, { signal: AbortSignal.timeout(15_000) }).then(response => response.json())
    // `/fr/meta` stays excluded: the build decided it.
    expect(paths).toEqual(['/en', '/en/docs/getting-started', '/fr/guide'])
  })

  it('prerenders the layer\'s pages', () => {
    const page = (path: string) => readFileSync(join(useTestContext().nuxt!.options.nitro.output!.dir!, 'static', path, 'index.html'), 'utf8')
    expect(page('en')).toContain('English landing page.')
    expect(page('en/docs/getting-started')).toContain('English docs page.')
    expect(page('fr/guide')).toContain('Page en français.')
  })

  // Only `app/content.worker.ts` reads them in the browser.
  it('keeps the snapshots out of the public files without a content worker', () => {
    expect(existsSync(join(useTestContext().nuxt!.options.nitro.output!.dir!, 'static/__nuxt_content'))).toBe(false)
  })

  it('types the layer\'s source with its declared schema', () => {
    const types = readFileSync(join(useTestContext().nuxt!.options.buildDir, 'content/types.d.ts'), 'utf8')
    // `target` only comes from the schema: no document sets it.
    expect(types).toMatch(/target\?:/)
  })
})
