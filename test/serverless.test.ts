import { spawn, type ChildProcess } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { afterAll, beforeAll, describe, it, expect } from 'vitest'
import { setup, useTestContext } from '@nuxt/test-utils/e2e'

describe('serverless', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/serverless', import.meta.url)),
    // Started below as Vercel runs it: only the function, without the static files.
    server: false,
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
  })

  // Public files only live on the CDN and the sources aren't deployed, so content must come from the build output.
  it('queries content at runtime', { timeout: 20_000 }, async () => {
    const html = await fetch(url, { signal: AbortSignal.timeout(15_000) }).then(response => response.text())
    expect(html).toContain('Hello serverless')
  })
})
