import { NuxtContentInstance } from '.'

declare module 'vuex' {
  interface Store<S> {
    $http: NuxtContentInstance
  }
}