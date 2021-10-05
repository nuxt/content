import fs from 'fs/promises'
import { resolve } from 'pathe'
import { Nuxt } from '@nuxt/kit'

export async function useNuxtIgnoreList(nuxt: Nuxt): Promise<string[]> {
  const ignore = ['**/-*.*', '**/node_modules/**', '**/.git/**', '**/.**']
  const ignoreFile = resolve(nuxt.options.rootDir, '.nuxtignore')
  const ignoreContent = await fs.readFile(ignoreFile, { encoding: 'utf-8' }).catch(() => '')

  if (ignoreContent) {
    ignore.push(...ignoreContent.split('\n').filter(Boolean))
  }

  const refinedList = ignore.map((pattern: any) => {
    if (typeof pattern === 'string') {
      return pattern.replace(/\//g, ':')
    }
    return pattern
  })

  return refinedList
}
