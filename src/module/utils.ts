import { useNuxt } from '@nuxt/kit'
import consola from 'consola'

export const logger = consola.withScope('docus')

export function addContentPlugin(plugin: string) {
  const nuxt = useNuxt()

  nuxt.options.docus!.content!.plugins!.push(plugin)
}
