import { NuxtConfig } from '@nuxt/types'

export interface DocusSettings<T = any> {
  title: string
  contentDir: string
  description: string
  credits: boolean
  url: string
  template: string
  theme?: T
  [key: string]: any
}

export declare const withDocus: (_config: NuxtConfig) => NuxtConfig
