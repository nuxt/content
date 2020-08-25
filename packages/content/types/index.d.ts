import '@nuxt/types'
import './vuex'

import { DumpOptions as yamlOptions } from 'js-yaml'
import { OptionsV2 as xmlOptions } from 'xml2js'
import { CSVParseParam as csvOptions } from 'csvtojson/v2/Parameters'

interface NuxtContentInstance {
  only(keys: string | string[]): NuxtContentInstance
  without(keys: string | string[]): NuxtContentInstance
  sortBy(field: string, direction?: string): NuxtContentInstance
  where(query: Object): NuxtContentInstance
  search(query: Object | string, value?: string): NuxtContentInstance
  surround(slug: string, options?: Object): NuxtContentInstance
  limit(n: number | string): NuxtContentInstance
  skip(n: number | string): NuxtContentInstance
  fetch<T = Result | Result[]>(): Promise<T>
}

type contentFunc = (...args: Array<string | Object>) => NuxtContentInstance

type Result = (Object[] & {
  0: ('parallel' | 'sequential');
});

declare module '@nuxt/vue-app' {
  interface Context {
    $content: contentFunc
  }
}

type extendOrOverwrite<T> = ((old: T) => T) | T

// Nuxt 2.9+
declare module '@nuxt/types' {
  interface Context {
    $content: contentFunc
  }

  interface Configuration {
    content?: {
      watch?: boolean,
      liveEdit?: boolean,
      apiPrefix?: string,
      dir?: string,
      fullTextSearchFields?: extendOrOverwrite<Array<string>>,
      nestedProperties?: extendOrOverwrite<Array<string>>,
      markdown?: {
        remarkPlugins?: extendOrOverwrite<Array<string>>,
        rehypePlugins?: extendOrOverwrite<Array<string>>,
        prism?: {
          theme?: string | false
        }
      },
      yaml?: yamlOptions,
      csv?: csvOptions,
      xml?: xmlOptions,
      extendParser?: {
        [extension: string]: (file: string) => any
      }
    }
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $content: contentFunc
  }
}
