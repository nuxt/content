// Isolated module to avoid an import cycle between `source.ts` and `discover.ts`.
let assetExtensions: string[] = []

export function setAssetExtensions(extensions: string[]): void {
  assetExtensions = [...extensions]
}

export function getAssetExtensions(): string[] {
  return [...assetExtensions]
}
