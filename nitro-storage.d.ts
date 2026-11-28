// Only Nitro 2 is installed here, for `src/runtime/server/internal/storage.ts`; Nitro 3's `useStorage` has the same signature.
declare module 'nitro/storage' {
  export { useStorage } from 'nitropack/runtime'
}
