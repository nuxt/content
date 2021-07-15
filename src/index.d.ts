import { NuxtConfig, Context } from '@nuxt/types'
import { useDocusApi, DocusNavigation } from '@docus/core'

export interface DefaultThemeSettings {
  [key: string]: any
}
export interface DocusSettings<T = DefaultThemeSettings> {
  title: string
  contentDir: string
  description: string
  credits: boolean
  url: string
  template: string
  theme?: T
  [key: string]: any
}

export type DocusState<T = DefaultThemeSettings> = {
  currentPage: DocusDocument | null
  settings: DocusSettings<T> | null
  navigation: DocusNavigation
  theme: any
  layout: any
}

export type PermissiveContext = Context & { [key: string]: any }

export interface DocusAddonContext<T = DefaultThemeSettings> {
  ssrContext: Context['ssrContext']
  context: PermissiveContext
  state: DocusState
  settings: DocusSettings<T>
  createQuery: any
  api: ReturnType<typeof useDocusApi>
  $nuxt?: any
}

export type DocusRuntimeInstance<T = DefaultThemeSettings> = {
  settings: Ref<Omit<DocusSettings, 'theme'>>
  navigation: Ref<DocusNavigation>
  theme: Ref<T>
  [key: string]: any
} & ReturnType<typeof useDocusApi>

export interface Colors {
  [key: string]: string | Colors
}

export declare const withDocus: (_config: NuxtConfig) => NuxtConfig
