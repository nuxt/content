import { NuxtContentInstance } from '.'

declare module 'vuex/types/index' {
  interface Store<S> {
    $content: NuxtContentInstance
  }
}