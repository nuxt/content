import { type FSStorageOptions } from 'unstorage/drivers/fs'
import { type HTTPOptions } from 'unstorage/drivers/http'
import { type GithubOptions } from 'unstorage/drivers/github'

export type MountOptions = {
  driver: 'fs' | 'http' | string
  name?: string
  prefix?: string
  base?: string
} & FSStorageOptions & HTTPOptions & GithubOptions
