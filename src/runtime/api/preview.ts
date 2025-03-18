import type { ComponentMeta } from 'vue-component-meta'
import { eventHandler } from 'h3'
import type { RuntimeConfig } from '@nuxt/content'
import { useRuntimeConfig, useAppConfig } from '#imports'
// @ts-expect-error import does exist
import components from '#nuxt-component-meta/nitro'
import { collections, gitInfo, appConfigSchema } from '#content/preview'

interface NuxtComponentMeta {
  pascalName: string
  filePath: string
  meta: ComponentMeta
  global: boolean
}

export default eventHandler(async () => {
  const mappedComponents = (Object.values(components) as NuxtComponentMeta[])
    .map(({ pascalName, filePath, meta }) => {
      return {
        name: pascalName,
        path: filePath,
        meta: {
          props: meta.props,
          slots: meta.slots,
          events: meta.events,
        },
      }
    })

  const appConfig = useAppConfig()
  const runtimeConfig = useRuntimeConfig()
  const { content } = runtimeConfig
  const { preview } = runtimeConfig.public
  const { version } = content as RuntimeConfig['content']

  return {
    version,
    preview,
    gitInfo,
    collections,
    appConfigSchema,
    appConfig,
    components: mappedComponents,
  }
})
