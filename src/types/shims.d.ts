declare module '#content/integrity' {
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
