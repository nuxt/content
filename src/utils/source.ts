import fsDriver, { type FSStorageOptions } from 'unstorage/drivers/fs'
import httpDriver, { type HTTPOptions } from 'unstorage/drivers/http'
import githubDriver, { type GithubOptions } from 'unstorage/drivers/github'
import type { MountOptions } from '../types/source'

const unstorageDrivers = {
  fs: fsDriver,
  http: httpDriver,
  github: githubDriver,
}

/**
 * Resolve driver of a mount.
 */
export async function getMountDriver(options: MountOptions) {
  const dirverName = options.driver as keyof typeof unstorageDrivers
  switch (dirverName) {
    case 'fs':
      return fsDriver(options as FSStorageOptions)
    case 'http':
      return httpDriver(options as HTTPOptions)
    case 'github':
      return githubDriver(options as GithubOptions)
    default:
      try {
        return (await import(options.driver)).default(options)
      }
      catch (e) {
        console.error('Couldn\'t load driver', options.driver)
      }
  }
}

/**
 * Generate mount options for content storages
 */
export function generateStorageMountOptions(storages: Record<string, MountOptions>) {
  const key = (path: string, prefix = '') => `${path.replace(/[/:]/g, '_')}${prefix.replace(/\//g, ':')}`

  return Object.entries(storages).reduce((mounts, [name, storage]) => {
    mounts[key(name, storage.prefix)] = storage
    return mounts
  }, {} as Record<string, MountOptions>)
}

export function* chunks<T>(arr: T[], size: number): Generator<T[], void, unknown> {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size)
  }
}
