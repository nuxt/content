import fs from 'fs/promises'
import { Nuxt } from '@nuxt/kit'
import { join, resolve } from 'upath'

export async function useNuxtIgnoreList(nuxt: Nuxt): Promise<string[]> {
  const ignore = nuxt.options.ignore || []
  const ignoreFile = resolve(nuxt.options.rootDir, '.nuxtignore')
  const ignoreContent = await fs.readFile(ignoreFile, { encoding: 'utf-8' }).catch(() => '')

  if (ignoreContent) {
    ignore.push(...ignoreContent.split('\n').filter(Boolean))
  }

  // Ignore '.' prefixed files
  ignore.push('**/node_modules/**', '**/.git/**', join(nuxt.options.rootDir, '**/.**'))

  return ignore
}
