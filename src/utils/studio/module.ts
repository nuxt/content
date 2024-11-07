import {
  addPlugin,
  addComponent,
  installModule,
  addPrerenderRoutes,
  addServerHandler,
  type Resolver,
  addTemplate,
} from '@nuxt/kit'
import type { Schema } from 'untyped'
import type { Nuxt } from '@nuxt/schema'
import { getGitEnv, getLocalGitInfo } from '../git'
import type { ModuleOptions } from '../../types'
import { studioTemplate } from '../templates'
import type { Manifest } from '../../types/manifest'

export async function setupStudio(options: ModuleOptions, nuxt: Nuxt, resolver: Resolver, manifest: Manifest) {
  const studioOptions = options.studio!

  const { resolve } = resolver
  const apiURL = process.env.STUDIO_API || 'https://api.nuxt.studio'
  const iframeMessagingAllowedOrigins = process.env.IFRAME_MESSAGING_ALLOWED_ORIGINS
  const gitInfo = studioOptions.gitInfo || await getLocalGitInfo(nuxt.options.rootDir) || getGitEnv() || {}

  // Public runtimeConfig
  nuxt.options.runtimeConfig.public.studio = { apiURL, iframeMessagingAllowedOrigins }

  nuxt.hook('schema:resolved', (schema: Schema) => {
    // Add studio templates once schema is resolved
    const template = addTemplate(studioTemplate(manifest.collections, gitInfo, schema)).dst
    nuxt.options.nitro.alias['#content/studio'] = template
    nuxt.options.alias['#content/studio'] = template
  })

  // Add plugins
  addPlugin(resolver.resolve('./runtime/plugins/studio/preview.client'))

  // Register preview banner component
  addComponent({ name: 'StudioPreviewMode', filePath: resolver.resolve('./runtime/components/StudioPreviewMode.vue') })

  // Generate '__studio.json' file with all metadatas to empower Studio experience
  addServerHandler({
    method: 'get',
    route: '/__studio.json',
    handler: resolve('./runtime/api/studio'),
  })
  addPrerenderRoutes('/__studio.json')

  // // Install dependencies
  await installModule('nuxt-component-meta', {
    globalsOnly: true,
  })
}
