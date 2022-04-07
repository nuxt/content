import { createResolver, templateUtils } from '@nuxt/kit'
import type { NuxtTemplate } from '@nuxt/schema'

export const transformersTemplate: NuxtTemplate = {
  filename: 'nuxt-content-transformers.mjs',
  write: true,
  getContents: ({ options }) => {
    return [
      templateUtils.importSources(options.transformers),
      `const transformers = [${options.transformers.map(templateUtils.importName).join(', ')}]`,
      'export const getParser = (ext) => transformers.find(p => p.extentions.includes(ext) && p.parse)',
      'export const getTransformers = (ext) => transformers.filter(p => ext.match(new RegExp(p.extentions.join("|"))) && p.transform)',
      'export default () => {}'
    ].join('\n')
  }
}

export const typeTemplate: NuxtTemplate = {
  filename: 'types/nuxt-content.d.ts',
  getContents: () => {
    const { resolve } = createResolver(import.meta.url)
    return [
      `declare module "${resolve('./runtime/types')}" {`,
      '}',
      '\nexport {}'
    ].join('\n')
  }
}
