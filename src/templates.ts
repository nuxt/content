import { createResolver, templateUtils } from '@nuxt/kit'
import type { NuxtTemplate } from '@nuxt/schema'

export const contentPluginTemplate: NuxtTemplate = {
  filename: 'content-plugins.mjs',
  write: true,
  getContents: ({ options }) => {
    return `${templateUtils.importSources(options.transformers)}
      export const plugins = [${options.transformers.map(templateUtils.importName).join(', ')}];
      export const getParser = (ext) => plugins.find(p => p.extentions.includes(ext) && p.parse);
      export const getTransformers = (ext) => plugins.filter(p => ext.match(new RegExp(p.extentions.join('|'))) && p.transform);
      export default () => {};
    `
  }
}

export const queryPluginTemplate: NuxtTemplate = {
  filename: 'query-plugins.mjs',
  write: true,
  getContents: ({ options }) => `${templateUtils.importSources(options.queries || [])}

  export const plugins = [${(options.queries || []).map((src: string) => templateUtils.importName(src)).join(',\n')}]
  `
}

export const typeTemplate: NuxtTemplate = {
  filename: 'types/nuxt-content.d.ts',
  getContents: ({ options }) => {
    const { resolve } = createResolver(import.meta.url)
    const { queries = [] } = options
    return [
      `declare module "${resolve('./runtime/types')}" {`,
      ...queries?.map(src => `  type ${templateUtils.importName(src)} = import('${src.replace(/\.ts$/, '')}').Queries;`),
      ...queries?.map(src => `  interface QueryBuilder extends ${templateUtils.importName(src)} {}`),
      '}',
      '\nexport {}'
    ].join('\n')
  }
}
