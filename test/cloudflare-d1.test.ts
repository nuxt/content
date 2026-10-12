// @vitest-environment node
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import Database from 'better-sqlite3'
import { createResolver } from '@nuxt/kit'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

/**
 * End-to-end tests of the lazy D1 import, on workerd (through `wrangler dev`) with a local D1 database.
 * See https://github.com/nuxt/content/issues/3854, https://github.com/nuxt/content/issues/3683
 * and https://github.com/nuxt/content/issues/3159
 *
 * The local runtime does not cancel a request when its client disconnects, so the
 * cancellations seen in production are reproduced by:
 * - killing workerd in the middle of an import (an evicted isolate or a deployment)
 * - a request that returns while its import is in flight (workerd tears down its I/O)
 */

const resolver = createResolver(import.meta.url)
const rootDir = resolver.resolve('./fixtures/cloudflare-d1')
const persistDir = resolver.resolve('./fixtures/cloudflare-d1/.data/wrangler')
const DOCS = 1500

function generateContent() {
  const dir = `${rootDir}/content/docs`
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  for (let i = 0; i < DOCS; i++) {
    // enough rows for the import to take a few seconds, so it can be interrupted
    writeFileSync(`${dir}/doc-${String(i).padStart(4, '0')}.json`, JSON.stringify({ title: `Doc ${i}`, body: 'x'.repeat(2000) }))
  }
}

function build() {
  const result = spawnSync('npx', ['nuxi', 'build'], { cwd: rootDir, encoding: 'utf-8' })
  if (result.status !== 0) {
    throw new Error(`Fixture build failed:\n${result.stdout}\n${result.stderr}`)
  }
}

function freePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer()
    server.unref()
    server.on('error', reject)
    server.listen(0, () => {
      const { port } = server.address() as { port: number }
      server.close(() => resolve(port))
    })
  })
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** A `wrangler dev` process: a fresh workerd isolate on top of the persisted D1 database */
class Worker {
  process?: ChildProcess
  logs = ''
  url = ''

  async start() {
    const port = await freePort()
    this.url = `http://127.0.0.1:${port}`
    this.logs = ''
    this.process = spawn('npx', ['wrangler', 'dev', '--port', String(port), '--persist-to', persistDir, '--ip', '127.0.0.1'], {
      cwd: rootDir,
      env: { ...process.env, WRANGLER_SEND_METRICS: 'false', CI: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    })
    this.process.stdout!.on('data', (data) => {
      this.logs += data
    })
    this.process.stderr!.on('data', (data) => {
      this.logs += data
    })
    for (let i = 0; i < 240; i++) {
      if (await fetch(`${this.url}/_headers`).then(() => true, () => false)) {
        return
      }
      await sleep(250)
    }
    throw new Error(`wrangler dev did not start:\n${this.logs}`)
  }

  /** Kills workerd at once, as an eviction or a deployment would */
  async kill() {
    if (!this.process?.pid) return
    const exited = new Promise(resolve => this.process!.once('exit', resolve))
    process.kill(-this.process.pid, 'SIGKILL')
    await exited
    this.process = undefined
  }

  async get(path: string, timeout = 120_000) {
    const start = Date.now()
    const response = await fetch(`${this.url}${path}`, { signal: AbortSignal.timeout(timeout) })
    return { status: response.status, body: await response.text(), ms: Date.now() - start }
  }
}

/** Reads the local D1 database straight from its SQLite file */
function readD1() {
  const dir = `${persistDir}/v3/d1/miniflare-D1DatabaseObject`
  let db: Database.Database
  try {
    const file = readdirSync(dir).find(name => name.endsWith('.sqlite') && name !== 'metadata.sqlite')
    db = new Database(`${dir}/${file}`, { readonly: true, fileMustExist: true })
  }
  catch {
    // the database is created on its first use
    return { info: [], items: 0 }
  }
  try {
    const info = db.prepare('SELECT id, ready, version FROM _content_info ORDER BY id').all() as { id: string, ready: number, version: string }[]
    const items = (db.prepare('SELECT COUNT(*) AS count FROM _content_docs').get() as { count: number }).count
    return { info, items }
  }
  catch {
    return { info: [], items: 0 }
  }
  finally {
    db.close()
  }
}

describe.sequential('cloudflare d1 (workerd)', () => {
  const worker = new Worker()

  beforeAll(() => {
    generateContent()
    build()
  }, 300_000)

  afterAll(async () => {
    await worker.kill()
    rmSync(`${rootDir}/content`, { recursive: true, force: true })
    rmSync(persistDir, { recursive: true, force: true })
  })

  async function freshDatabase() {
    await worker.kill()
    rmSync(persistDir, { recursive: true, force: true })
    await worker.start()
  }

  test('the first request imports the collection', async () => {
    await freshDatabase()

    const { status, body } = await worker.get('/api/docs')
    expect(status).toBe(200)
    expect(JSON.parse(body)).toEqual({ count: DOCS })
    expect(readD1().info).toEqual([expect.objectContaining({ id: 'checksum_docs', ready: 1 })])
  }, 120_000)

  test('concurrent first requests all get the full collection and leave no lease behind', async () => {
    await freshDatabase()

    const responses = await Promise.all(Array.from({ length: 8 }, () => worker.get('/api/docs')))
    for (const { status, body } of responses) {
      expect(status).toBe(200)
      expect(JSON.parse(body)).toEqual({ count: DOCS })
    }
    const { info, items } = readD1()
    expect(items).toBe(DOCS)
    // no lease is left behind
    expect(info.map(row => row.id)).toEqual(['checksum_docs'])
  }, 180_000)

  test('a fresh isolate recovers from an import killed half-way (`ready = 0` left in D1)', async () => {
    await freshDatabase()

    // start the import and kill workerd once part of the rows are written
    const pending = worker.get('/api/docs').catch(() => null)
    let state = readD1()
    for (let i = 0; i < 400 && !(state.items > 0 && state.items < DOCS); i++) {
      await sleep(10)
      state = readD1()
    }
    await worker.kill()
    await pending

    state = readD1()
    expect(state.items).toBeGreaterThan(0)
    expect(state.items).toBeLessThan(DOCS)
    expect(state.info.find(row => row.id === 'checksum_docs')?.ready).toBe(0)

    // a new isolate must take the import over and serve the whole collection
    await worker.start()
    const { status, body, ms } = await worker.get('/api/docs')
    expect(status).toBe(200)
    expect(JSON.parse(body)).toEqual({ count: DOCS })
    // the lease of the dead import expires after 30s, well before the former 90s wait
    expect(ms).toBeLessThan(60_000)
    expect(readD1().info).toEqual([expect.objectContaining({ id: 'checksum_docs', ready: 1 })])
  }, 240_000)

  test('a request that leaves while the import runs does not hang the isolate', async () => {
    await freshDatabase()

    expect((await worker.get('/api/kick')).body).toBe('started')
    await sleep(200)

    // same isolate: must neither hang nor see a partial collection
    const { status, body, ms } = await worker.get('/api/docs', 120_000)
    expect(status).toBe(200)
    expect(JSON.parse(body)).toEqual({ count: DOCS })
    expect(ms).toBeLessThan(60_000)

    // and the next isolate finds a complete database
    await worker.kill()
    await worker.start()
    expect(JSON.parse((await worker.get('/api/docs')).body)).toEqual({ count: DOCS })
    expect(readD1().info).toEqual([expect.objectContaining({ id: 'checksum_docs', ready: 1 })])
  }, 240_000)
})
