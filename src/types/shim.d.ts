import { Storage } from 'unstorage'

declare module '@docus/core/node' {
  export const useStorage: () => Storage
}
