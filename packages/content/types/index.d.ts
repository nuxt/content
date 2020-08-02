import '@nuxt/types'
import './vuex'

import { DumpOptions as yamlOptions } from "js-yaml";
import { OptionsV2 as xmlOptions } from 'xml2js'
import { CSVParseParam as csvOptions } from "node-csvtojson/v2/Parameters";

interface NuxtContentInstance {
  only(keys: String | String[]): NuxtContentInstance
  without(keys: String | String[]): NuxtContentInstance
  sortBy(field: String, direction?: String): NuxtContentInstance
  where(query: Object): NuxtContentInstance
  search(query: Object | String, value?: String): NuxtContentInstance
  surround(slug: String, options?: Object): NuxtContentInstance
  limit(n: Number | String): NuxtContentInstance
  skip(n: Number | String): NuxtContentInstance
  fetch<T = Result | Result[]>(): Promise<T>
}

type contentFunc = (...args: Array<String | Object>) => NuxtContentInstance

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
    content: {
      watch: boolean,
      liveEdit: boolean,
      apiPrefix: string,
      dir: string,
      fullTextSearchFields: extendOrOverwrite<Array<string>>,
      nestedProperties: extendOrOverwrite<Array<string>>,
      markdown: {
        remarkPlugins: extendOrOverwrite<Array<string>>,
        rehypePlugins: extendOrOverwrite<Array<string>>,
        prism: {
          theme: string | false
        }
      },
      yaml: yamlOptions,
      csv: csvOptions,
      xml: xmlOptions,
      extendParser: {
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
