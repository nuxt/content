import { defineDriver } from 'unstorage'
import { $fetch } from 'ofetch'
import { joinURL } from 'ufo'
const defaultOptions = {
  repo: '',
  branch: 'main',
  ttl: 600,
  dir: '',
  apiURL: 'https://api.github.com',
  cdnURL: 'https://raw.githubusercontent.com'
}
const DRIVER_NAME = 'github'
export default defineDriver((_opts) => {
  const opts = { ...defaultOptions, ..._opts }
  const rawUrl = joinURL(opts.cdnURL, opts.repo, opts.branch, opts.dir)
  let files = {}
  let lastCheck = 0
  let syncPromise
  const syncFiles = async () => {
    if (!opts.repo) {
      throw new Error('[unstorage] [github] \'repo\' is required.')
    }
    if (lastCheck + opts.ttl * 1e3 > Date.now()) {
      return
    }
    if (!syncPromise) {
      syncPromise = fetchFiles(opts)
    }
    files = await syncPromise
    lastCheck = Date.now()
    syncPromise = undefined
  }
  return {
    name: DRIVER_NAME,
    options: opts,
    async getKeys () {
      await syncFiles()
      return Object.keys(files)
    },
    async hasItem (key) {
      await syncFiles()
      return key in files
    },
    async getItem (key) {
      await syncFiles()
      const item = files[key]
      if (!item) {
        return null
      }
      if (!item.body) {
        try {
          item.body = await $fetch(key.replace(/:/g, '/'), {
            baseURL: rawUrl,
            headers: opts.token
              ? { Authorization: `token ${opts.token}` }
              : undefined
          })
        } catch {
          throw new Error(`[unstorage] [github] Failed to fetch '${key}'.`)
        }
      }
      return item.body
    },
    async getMeta (key) {
      await syncFiles()
      const item = files[key]
      return item ? item.meta : null
    }
  }
})

async function fetchFiles (opts) {
  const withTrailingSlash = string => string.endsWith('/') ? string : `${string}/`

  const prefix = withTrailingSlash(opts.dir).replace(/^\//, '')
  const files = {}
  try {
    const trees = await $fetch(
      `/repos/${opts.repo}/git/trees/${opts.branch}?recursive=1`,
      {
        baseURL: opts.apiURL,
        headers: opts.token
          ? { Authorization: `token ${opts.token}` }
          : undefined
      }
    )
    for (const node of trees.tree) {
      if (node.type !== 'blob' || !node.path.startsWith(prefix)) {
        continue
      }
      const key = node.path.substring(prefix.length).replace(/\//g, ':')
      files[key] = {
        meta: {
          sha: node.sha,
          mode: node.mode,
          size: node.size
        }
      }
    }
    return files
  } catch (error) {
    throw new Error('[unstorage] [github] Failed to fetch git tree.')
  }
}
