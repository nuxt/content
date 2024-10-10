declare module '#content-v3/integrity' {
  export const collectionsIv: string
  export const contentsIv: string
  export const integrityVersion: string
}

declare module '#content-v3/components' {
  export const globalComponents: string[]
  export const localComponents: string[]
}

declare module '#content-v3/dump' {
  export const dump: string
}

declare module '#content-v3/collections' {
  export const collections: Record<string, unknown>
}
