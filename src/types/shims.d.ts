declare module '#content/integrity' {
  export const collectionsIv: string
  export const contentsIv: string
  export const integrityVersion: string
}

declare module '#content/components' {
  export const globalComponents: string[]
  export const localComponents: string[]
}

declare module '#content/dump' {
  export const dump: string
}

declare module '#content/collections' {
  export const collections: Record<string, unknown>
}
