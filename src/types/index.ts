import './shims.d'
import { Context } from '@nuxt/types'
import type { DocusDocument } from '@docus/core'
import { DocusNavigation } from '../context/runtime/composables'

export * from './navigation'

export type PermissiveContext = Context & { [key: string]: any }

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

export type DocusInstance<T = DefaultThemeSettings> = {
  content?: Context['$content']
  currentPath?: string
  navigation?: DocusNavigation
  currentPage?: DocusDocument
  settings?: DocusSettings<T>
  theme?: DocusSettings<T>['theme']
  layout?: {
    [key: string]: any
  }
}

export interface DocusAddonContext {
  context: PermissiveContext
  ssrContext: Context['ssrContext']
  instance: DocusInstance
}

export interface Colors {
  [key: string]: string | Colors
}
