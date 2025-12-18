import fs from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'pathe'
import { readGitConfig } from 'pkg-types'
import gitUrlParse from 'git-url-parse'
import git from 'isomorphic-git'
import gitHttp from 'isomorphic-git/http/node'

import type { GitBasicAuth, GitRefType, GitTokenAuth } from '../types'

export interface GitInfo {
  // Repository name
  name: string
  // Repository owner/organization
  owner: string
  // Repository URL
  url: string
}

export async function downloadGitRepository(url: string, cwd: string, auth?: GitBasicAuth | GitTokenAuth | string, ref?: GitRefType) {
  const cacheFile = join(cwd, '.content.cache.json')
  const cache = await readFile(cacheFile, 'utf8').then(d => JSON.parse(d)).catch((): null => null)
  const hash = await getGitRemoteHash(url, ref)

  if (cache) {
    // Directory exists, skip download
    if (hash === cache.hash) {
      await writeFile(cacheFile, JSON.stringify({
        ...cache,
        updatedAt: new Date().toISOString(),
      }, null, 2))
      return
    }
  }

  await mkdir(cwd, { recursive: true })

  let formattedRef: string | undefined
  if (ref) {
    if (ref.branch) formattedRef = `refs/heads/${ref.branch}`
    if (ref.tag) formattedRef = `refs/tags/${ref.tag}`
  }

  const authUrl = new URL(url)
  if (typeof (auth) === 'string') {
    authUrl.password = auth
  }
  if (typeof (auth) === 'object') {
    if (auth.username) authUrl.username = auth.username

    if ('token' in auth) {
      authUrl.password = auth.token!
    }

    if ('password' in auth) {
      authUrl.password = auth.password!
    }
  }

  await git.clone({ fs, http: gitHttp, dir: cwd, url: authUrl.toString(), depth: 1, singleBranch: true, ref: formattedRef })

  await writeFile(cacheFile, JSON.stringify({
    url: url,
    hash: hash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, null, 2))
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

export async function getGitRemoteHash(url: string, ref?: GitRefType): Promise<string | undefined> {
  try {
    const remote = await git.getRemoteInfo({ http: gitHttp, url })
    if (ref) {
      if (ref.branch) {
        const headRef = remote.refs.heads![ref.branch]
        return headRef
      }

      if (ref.tag) {
        const tagsRef = remote.refs.tags![ref.tag]
        return tagsRef
      }
    }
    else {
      // default to the HEAD ref provided by the server
      const head = remote.HEAD!.replace('refs/heads/', '')
      const headRef = remote.refs.heads![head]
      return headRef
    }
  }
  catch {
    // ignore error
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
