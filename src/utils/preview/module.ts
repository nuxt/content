import {
  addPlugin,
  addComponent,
  installModule,
  addPrerenderRoutes,
  addServerHandler,

  addTemplate,
} from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import type { Schema } from 'untyped'
import type { Nuxt } from '@nuxt/schema'
import { getGitEnv, getLocalGitInfo } from '../git'
import type { GitInfo } from '../git'
import type { ModuleOptions } from '../../types'
import { previewTemplate } from '../templates'
import type { Manifest } from '../../types/manifest'

export async function setupPreview(options: ModuleOptions, nuxt: Nuxt, resolver: Resolver, manifest: Manifest) {
  const previewOptions = options.preview!

  const { resolve } = resolver
  const api = process.env.NUXT_CONTENT_PREVIEW_API || previewOptions.api
  const iframeMessagingAllowedOrigins = process.env.PREVIEW_ALLOWED_ORIGINS
  const gitInfo = previewOptions.gitInfo || await getLocalGitInfo(nuxt.options.rootDir) || getGitEnv() || {} as GitInfo

  // Public runtimeConfig
  nuxt.options.runtimeConfig.public.preview = { api, iframeMessagingAllowedOrigins }

  if (process.env.NUXT_CONTENT_PREVIEW_STAGING_API) {
    // @ts-expect-error do not exposed it in runtimeConfig
    nuxt.options.runtimeConfig.public.preview.stagingApi = process.env.NUXT_CONTENT_PREVIEW_STAGING_API
  }

  nuxt.hook('schema:resolved', (schema: Schema) => {
    // Add preview templates once schema is resolved
    const template = addTemplate(previewTemplate(manifest.collections, gitInfo, schema)).dst
    nuxt.options.nitro.alias ||= {}
    nuxt.options.nitro.alias['#content/preview'] = template
    nuxt.options.alias['#content/preview'] = template
  })

  // Add plugins
  addPlugin(resolver.resolve('./runtime/plugins/preview.client'))

  // Register preview banner component
  addComponent({ name: 'ContentPreviewMode', filePath: resolver.resolve('./runtime/components/ContentPreviewMode.vue') })

  // Generate '__preview.json' file with all metadatas to empower preview experience
  addServerHandler({
    method: 'get',
    route: '/__preview.json',
    handler: resolve('./runtime/api/preview'),
  })
  addPrerenderRoutes('/__preview.json')

  // // Install dependencies
  await installModule('nuxt-component-meta', {
    globalsOnly: true,
    include: manifest.components,
  })
}

export function shouldEnablePreview(nuxt: Nuxt, options: ModuleOptions) {
  if (process.env.NUXT_CONTENT_PREVIEW_API || options.preview?.api) {
    // Only enable preview in production build or when explicitly enabled
    if (nuxt.options.dev === true && !options.preview?.dev) {
      return false
    }
    return true
  }
  return false
}
