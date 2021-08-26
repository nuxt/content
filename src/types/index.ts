import './shims.d'
import { Context } from '@nuxt/types'
import type { DocusDocument } from '@docus/core'
import { Ref } from '@nuxtjs/composition-api'
import { DocusNavigation } from './navigation'

export * from './navigation'

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
  api: any
  $nuxt?: any
}

export type DocusRuntimeInstance<T = DefaultThemeSettings> = {
  settings: Ref<Omit<DocusSettings, 'theme'>>
  navigation: Ref<DocusNavigation>
  theme: Ref<T>
  [key: string]: any
}

export interface Colors {
  [key: string]: string | Colors
}
