import { cp, mkdir, readFile, rm } from 'node:fs/promises'
import { dirname, join } from 'pathe'
import { withLeadingSlash } from 'ufo'
import { glob } from 'tinyglobby'
import { imageSize } from 'image-size'
import type { Nuxt } from '@nuxt/schema'
import type { ResolvedCollection } from '../../types/collection'
import { getExcludedSourcePaths, parseSourceBase } from '../source'
import { logger } from '../dev'
import { removeOrdering } from './paths'
import { isImage, type AssetIndex, type ImageSizeHint } from './shared'

export function assetPublicUrl(relativeKey: string, sourcePrefix: string, prefix: string): string {
  return withLeadingSlash(join(prefix, sourcePrefix || '', removeOrdering(relativeKey)))
}

export function assetIndexKey(absolutePath: string): string {
  return removeOrdering(absolutePath)
}

export async function getAssetSize(absolutePath: string): Promise<{ width?: number, height?: number }> {
  try {
    const { width, height } = imageSize(await readFile(absolutePath))
    return { width, height }
  }
  catch {
    logger.warn(`Could not read image size of "${absolutePath}"`)
    return {}
  }
}

export interface DiscoverAssetsOptions {
  publicDir: string
  extensions: string[]
  imageSizes: ImageSizeHint[]
  prefix: string
  debug?: boolean
}

// Runs before content is parsed so the index is ready when `content:file:afterParse` fires.
export async function discoverAndCopyAssets(
  nuxt: Nuxt,
  collections: ResolvedCollection[],
  options: DiscoverAssetsOptions,
): Promise<{ index: AssetIndex, count: number }> {
  const index: AssetIndex = new Map()
  const { publicDir, extensions, imageSizes, prefix } = options
  const detectSizes = imageSizes.length > 0
  const pattern = `**/*.{${extensions.join(',')}}`

  await rm(publicDir, { recursive: true, force: true })

  for (const collection of collections) {
    if (!collection.source) {
      continue
    }
    for (const source of collection.source) {
      // @ts-expect-error - `__rootDir` is a private property storing the layer's cwd
      const rootDir = collection.__rootDir || nuxt.options.rootDir
      await source.prepare?.({ rootDir })
      const cwd = source.cwd
      if (!cwd) {
        continue
      }

      const { fixed } = parseSourceBase(source)
      const scanDir = join(cwd, fixed)
      const keys = await glob(pattern, {
        cwd: scanDir,
        ignore: getExcludedSourcePaths(source),
        dot: true,
        expandDirectories: false,
      }).catch((): string[] => [])

      for (const key of keys) {
        const absoluteSource = join(scanDir, key)
        const indexKey = assetIndexKey(absoluteSource)
        if (index.has(indexKey)) {
          continue
        }
        const url = assetPublicUrl(key, source.prefix || '', prefix)
        const target = join(publicDir, url)
        await mkdir(dirname(target), { recursive: true })
        await cp(absoluteSource, target)

        const { width, height } = detectSizes && isImage(absoluteSource) ? await getAssetSize(absoluteSource) : {}
        index.set(indexKey, { publicSrc: url, width, height, content: [] })
      }
    }
  }

  if (options.debug) {
    logger.info(`Copied ${index.size} content asset(s) to ${publicDir}`)
  }
  return { index, count: index.size }
}
