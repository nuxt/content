import { resolve } from 'path'
import fs from 'fs/promises'

export async function useNuxtIgnoreList(nuxt: any): Promise<string[]> {
  const ignore = nuxt.options.ignore || []
  const ignoreFile = resolve(nuxt.options.rootDir, '.nuxtignore')
  const ignoreContent = await fs.readFile(ignoreFile, { encoding: 'utf-8' }).catch(() => '')
  if (ignoreContent) {
    ignore.push(...ignoreContent.split('\n').filter(Boolean))
  }
  return ignore
}
