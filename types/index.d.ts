import Vue from 'vue'
import './vuex'

interface Toc {
  id: String
  depth: Number
  text: String
}

interface Result {
  body: Object
  dir: String
  extension: String
  path: String
  slug: String
  toc: Toc[]
  updatedAt: Date
}

interface NuxtContentInstance {
  only(keys: String | String[]): NuxtContentInstance
  sortBy(field: String, direction?: String): NuxtContentInstance
  where(query: Object): NuxtContentInstance
  search(query: Object | String, value?: String): NuxtContentInstance
  surround(slug: String, options?: Object): NuxtContentInstance
  limit(n: Number | String): NuxtContentInstance
  skip(n: Number | String): NuxtContentInstance
  fetch(): Result | Result[]
}

declare module '@nuxt/vue-app' {
  interface Context {
    $content(...args: String[]): NuxtContentInstance
  }
}

// Nuxt 2.9+
declare module '@nuxt/types' {
  interface Context {
    $content(...args: String[]): NuxtContentInstance
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $content(...args: String[]): NuxtContentInstance
  }
}