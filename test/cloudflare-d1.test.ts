// @vitest-environment node
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
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

interface Release {
  name: string
  titles: string[]
}

// enough rows for the import to take a few seconds, so it can be interrupted
const V1: Release = { name: 'v1', titles: Array.from({ length: 1500 }, (_, i) => `Doc ${i}`) }
// the next release removes 200 documents, changes 1000 and adds 100: an upgrade of the same table structure
const V2: Release = {
  name: 'v2',
  titles: Array.from({ length: 1400 }, (_, j) => j + 200).map(i => i < 1200 ? `Doc ${i} v2` : `Doc ${i}`),
}

/** Same as the fixture's `/api/docs` */
function fingerprint(titles: string[]) {
  const sorted = [...titles].sort()
  return { count: titles.length, fingerprint: `${sorted.join('|').length}:${sorted.at(0)}:${sorted.at(-1)}:${sorted.filter(title => title.endsWith(' v2')).length}` }
}

/** Builds the fixture with the documents of a release, into `.output-<release>` */
function build(release: Release) {
  const dir = `${rootDir}/content/docs`
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  for (const title of release.titles) {
    const id = title.split(' ')[1]!.padStart(4, '0')
    writeFileSync(`${dir}/doc-${id}.json`, JSON.stringify({ title, body: 'x'.repeat(2000) }))
  }
  const result = spawnSync('npx', ['nuxi', 'build'], { cwd: rootDir, encoding: 'utf-8' })
  if (result.status !== 0) {
    throw new Error(`Fixture build failed:\n${result.stdout}\n${result.stderr}`)
  }
  rmSync(`${rootDir}/.output-${release.name}`, { recursive: true, force: true })
  cpSync(`${rootDir}/.output`, `${rootDir}/.output-${release.name}`, { recursive: true })
}

/** Deploys a release: `wrangler.json` serves `.output` */
function deploy(release: Release) {
  rmSync(`${rootDir}/.output`, { recursive: true, force: true })
  cpSync(`${rootDir}/.output-${release.name}`, `${rootDir}/.output`, { recursive: true })
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

  /** Requests the collection until it is served, as a visitor reloading a page would */
  async docs(timeout = 120_000) {
    const start = Date.now()
    while (true) {
      const response = await this.get('/api/docs', timeout)
      // 503: the collection is being imported, never a partial collection
      if (response.status !== 503 || Date.now() - start > timeout) {
        return { ...response, ms: Date.now() - start }
      }
      await sleep(1000)
    }
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
    return { info: [], items: 0, upgraded: 0 }
  }
  try {
    const info = db.prepare('SELECT id, ready, version FROM _content_info ORDER BY id').all() as { id: string, ready: number, version: string }[]
    const items = (db.prepare('SELECT COUNT(*) AS count FROM _content_docs').get() as { count: number }).count
    const upgraded = (db.prepare('SELECT COUNT(*) AS count FROM _content_docs WHERE title LIKE \'% v2\'').get() as { count: number }).count
    return { info, items, upgraded }
  }
  catch {
    return { info: [], items: 0, upgraded: 0 }
  }
  finally {
    db.close()
  }
}

async function waitFor(condition: () => boolean, timeout = 5000) {
  for (const start = Date.now(); Date.now() - start < timeout; await sleep(10)) {
    if (condition()) return true
  }
  return false
}

describe.sequential('cloudflare d1 (workerd)', () => {
  const worker = new Worker()

  beforeAll(() => {
    build(V2)
    build(V1)
  }, 600_000)

  afterAll(async () => {
    await worker.kill()
    for (const dir of ['content', '.output-v1', '.output-v2', '.data']) {
      rmSync(`${rootDir}/${dir}`, { recursive: true, force: true })
    }
  })

  async function freshDatabase(release: Release = V1) {
    await worker.kill()
    rmSync(persistDir, { recursive: true, force: true })
    deploy(release)
    await worker.start()
  }

  async function expectServed(release: Release) {
    const { status, body } = await worker.docs()
    expect(status).toBe(200)
    expect(JSON.parse(body)).toEqual(fingerprint(release.titles))
  }

  function expectReady() {
    // ready, and no lease left behind
    expect(readD1().info).toEqual([expect.objectContaining({ id: 'checksum_docs', ready: 1 })])
  }

  test('the first request imports the collection', async () => {
    await freshDatabase()
    await expectServed(V1)
    expectReady()
  }, 120_000)

  test('concurrent first requests all get the full collection', async () => {
    await freshDatabase()

    const responses = await Promise.all(Array.from({ length: 8 }, () => worker.docs()))
    for (const { status, body } of responses) {
      expect(status).toBe(200)
      expect(JSON.parse(body)).toEqual(fingerprint(V1.titles))
    }
    expect(readD1().items).toBe(V1.titles.length)
    expectReady()
  }, 180_000)

  test('a fresh isolate recovers from an import killed half-way (`ready = 0` left in D1)', async () => {
    await freshDatabase()

    // start the import and kill workerd once part of the rows are written
    const pending = worker.get('/api/docs').catch(() => null)
    expect(await waitFor(() => readD1().items > 0 && readD1().items < V1.titles.length)).toBe(true)
    await worker.kill()
    await pending

    const state = readD1()
    expect(state.items).toBeGreaterThan(0)
    expect(state.items).toBeLessThan(V1.titles.length)
    expect(state.info.find(row => row.id === 'checksum_docs')?.ready).toBe(0)

    // a new isolate takes the import over and serves the whole collection
    await worker.start()
    const { ms } = await worker.docs()
    // the lease of the dead import expires after 30s, well before the former 90s wait
    expect(ms).toBeLessThan(60_000)
    await expectServed(V1)
    expectReady()
  }, 240_000)

  test('a request that leaves while the import runs does not hang the isolate', async () => {
    await freshDatabase()

    expect((await worker.get('/api/kick')).body).toBe('started')
    await sleep(200)

    // same isolate: must neither hang nor see a partial collection
    const { ms } = await worker.docs()
    expect(ms).toBeLessThan(60_000)
    await expectServed(V1)

    // and the next isolate finds a complete database
    await worker.kill()
    await worker.start()
    await expectServed(V1)
    expectReady()
  }, 240_000)

  test('a new release upgrades the collection in place', async () => {
    await freshDatabase(V1)
    await expectServed(V1)

    await worker.kill()
    deploy(V2)
    await worker.start()
    await expectServed(V2)
    expectReady()
  }, 240_000)

  test('an upgrade killed half-way is completed by the next isolate, never served partially', async () => {
    await freshDatabase(V1)
    await expectServed(V1)

    // deploy the new release and kill it in the middle of the upgrade
    await worker.kill()
    deploy(V2)
    await worker.start()
    const pending = worker.get('/api/docs').catch(() => null)
    expect(await waitFor(() => readD1().upgraded > 0 && readD1().upgraded < 1000)).toBe(true)
    await worker.kill()
    await pending
    const state = readD1()
    expect(state.upgraded).toBeGreaterThan(0)
    expect(state.upgraded).toBeLessThan(1000)

    // the next isolate completes the upgrade
    await worker.start()
    await expectServed(V2)
    expectReady()
  }, 240_000)
})
