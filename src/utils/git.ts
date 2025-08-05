import { createWriteStream } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { join } from 'pathe'
import { extract } from 'tar'
import { readGitConfig } from 'pkg-types'
import gitUrlParse from 'git-url-parse'

export interface GitInfo {
  // Repository name
  name: string
  // Repository owner/organization
  owner: string
  // Repository URL
  url: string
}

export async function downloadRepository(url: string, cwd: string, { headers }: { headers?: Record<string, string> } = {}) {
  const tarFile = join(cwd, '.content.clone.tar.gz')
  const cacheFile = join(cwd, '.content.cache.json')

  const cache = await readFile(cacheFile, 'utf8').then(d => JSON.parse(d)).catch((): null => null)
  if (cache) {
    // Directory exists, skip download
    const response = await fetch(url, { method: 'HEAD', headers })
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
    const response = await fetch(url, { headers })
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
    let branch = match[3] || 'main' // Default to 'main' if no branch is provided
    let path = match[4] || ''

    if (['fix', 'feat', 'chore', 'test', 'docs'].includes(branch)) {
      const pathParts = path.split('/')
      branch = join(branch, pathParts[0] || '')
      path = pathParts.slice(1).join('/')
    }

    return {
      org: org,
      repo: repo,
      branch: branch,
      path: path,
    }
  }

  return null
}

export function parseBitBucketUrl(url: string) {
  const bitbucketRegex = /https:\/\/bitbucket\.org\/([^/]+)\/([^/]+)(?:\/src\/([^/]+))?(?:\/(.+))?/
  const bitbucketMatch = url.match(bitbucketRegex)

  if (bitbucketMatch) {
    const org = bitbucketMatch[1]
    const repo = bitbucketMatch[2]
    let branch = bitbucketMatch[3] || 'main' // Default to 'main' if no branch is provided
    let path = bitbucketMatch[4] || ''

    if (['fix', 'feat', 'chore', 'test', 'docs'].includes(branch)) {
      const pathParts = path.split('/')
      branch = join(branch, pathParts[0] || '')
      path = pathParts.slice(1).join('/')
    }

    return {
      org: org,
      repo: repo,
      branch: branch,
      path: path,
    }
  }

  return null
}

export async function getLocalGitInfo(rootDir: string): Promise<GitInfo | undefined> {
  const remote = await getLocalGitRemote(rootDir)
  if (!remote) {
    return
  }

  // https://www.npmjs.com/package/git-url-parse#clipboard-example
  const { name, owner, source } = gitUrlParse(remote)
  const url = `https://${source}/${owner}/${name}`

  return {
    name,
    owner,
    url,
  }
}

export function getGitEnv(): GitInfo {
  // https://github.com/unjs/std-env/issues/59
  const envInfo = {
    // Provider
    provider: process.env.VERCEL_GIT_PROVIDER // vercel
      || (process.env.GITHUB_SERVER_URL ? 'github' : undefined) // github
      || '',
    // Owner
    owner: process.env.VERCEL_GIT_REPO_OWNER // vercel
      || process.env.GITHUB_REPOSITORY_OWNER // github
      || process.env.CI_PROJECT_PATH?.split('/').shift() // gitlab
      || '',
    // Name
    name: process.env.VERCEL_GIT_REPO_SLUG
      || process.env.GITHUB_REPOSITORY?.split('/').pop() // github
      || process.env.CI_PROJECT_PATH?.split('/').splice(1).join('/') // gitlab
      || '',
    // Url
    url: process.env.REPOSITORY_URL || '', // netlify
  }

  if (!envInfo.url && envInfo.provider && envInfo.owner && envInfo.name) {
    envInfo.url = `https://${envInfo.provider}.com/${envInfo.owner}/${envInfo.name}`
  }

  // If only url available (ex: Netlify)
  if (!envInfo.name && !envInfo.owner && envInfo.url) {
    try {
      const { name, owner } = gitUrlParse(envInfo.url)
      envInfo.name = name
      envInfo.owner = owner
    }
    catch {
      // Ignore error
    }
  }

  return {
    name: envInfo.name,
    owner: envInfo.owner,
    url: envInfo.url,
  }
}

async function getLocalGitRemote(dir: string) {
  try {
    const parsed = await readGitConfig(dir)
    if (!parsed) {
      return
    }
    return parsed.remote?.['origin']?.url
  }
  catch {
    // Ignore error
  }
}
