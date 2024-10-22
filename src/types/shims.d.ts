declare module '#content/manifest' {
  export const integrityVersion: string
  export default Record<string, unknown>
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
