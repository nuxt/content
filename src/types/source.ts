import { type FSStorageOptions } from 'unstorage/drivers/fs'
import { type HTTPOptions } from 'unstorage/drivers/http'
import { type GithubOptions } from 'unstorage/drivers/github'

interface FSMountOptions extends FSStorageOptions {
  driver: 'fs'
  base: string
  prefix?: string
}

interface GitMountOptions extends GithubOptions {
  driver: 'git'
  base: string
  prefix?: string
}

interface HTTPMountOptions extends HTTPOptions {
  driver: 'http'
  base: string
  prefix?: string
}

export type MountOptions = FSMountOptions | GitMountOptions | HTTPMountOptions
