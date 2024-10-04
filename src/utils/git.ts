import { createWriteStream } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { join } from 'pathe'
import { extract } from 'tar'

export async function downloadRepository(url: string, cwd: string) {
  const tarFile = join(cwd, '.content.clone.tar.gz')
  const cacheFile = join(cwd, '.content.cache.json')

  const cache = await readFile(cacheFile, 'utf8').then(d => JSON.parse(d)).catch(() => null)
  if (cache) {
    // Directory exists, skip download
    const response = await fetch(url, { method: 'HEAD' })
    const etag = response.headers.get('etag')
    if (etag === cache.etag) {
      await writeFile(cacheFile, JSON.stringify({
        ...cache,
        updatedAt: new Date().toISOString(),
      }, null, 2))
      return
    }
  }

  await mkdir(cwd, { recursive: true })

  try {
    const response = await fetch(url)
    const etag = response.headers.get('etag')
    console.log(etag)

    const stream = createWriteStream(tarFile)
    await promisify(pipeline)(response.body as unknown as ReadableStream[], stream)

    await extract({
      file: tarFile,
      cwd: cwd,
      onentry(entry) {
        // Remove root directory from zip contents to save files directly in cwd
        entry.path = entry.path.split('/').splice(1).join('/')
      },
    })

    await writeFile(cacheFile, JSON.stringify({
      url: url,
      etag: response.headers.get('etag'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, null, 2))
  }
  finally {
    await rm(tarFile, { force: true })
  }
}

export function parseGitHubUrl(url: string) {
  const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?(?:\/(.+))?/
  const match = url.match(regex)

  if (match) {
    const org = match[1]
    const repo = match[2]
    const branch = match[3] || 'main' // Default to 'main' if no branch is provided
    const path = match[4] || ''

    return {
      org: org,
      repo: repo,
      branch: branch,
      path: path,
    }
  }

  return null
}
