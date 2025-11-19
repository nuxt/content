// src/presets/shared-dumps.ts
import type { NitroConfig } from 'nitropack'
import type { Manifest } from '../types/manifest'
import { addTemplate } from '@nuxt/kit'
import { join } from 'pathe'
import { collectionDumpTemplate, collectionEncryptedDumpTemplate, fullDatabaseCompressedDumpTemplate } from '../utils/templates'

export interface ApplyDumpsOptions {
  manifest: Manifest
  resolver: { resolve: (p: string) => string }
  moduleOptions: { encryption?: { enabled?: boolean, masterKey?: string } }
  platform: 'cloudflare' | 'node' | 'nuxthub'
  exposePublicAssets?: boolean // default true (you allow public, but encrypted)
  includeLegacyCompressedModule?: boolean // default true for node preset
}

/**
 * One place to:
 * - emit per-collection templates (.sql or .sql.enc)
 * - expose content/raw if desired
 * - register handlers for dump + key endpoints
 * - wire legacy compressed dump module if needed (node)
 */
export function applyContentDumpsPreset(
  nitroConfig: NitroConfig,
  { manifest, resolver, moduleOptions, platform, exposePublicAssets = true, includeLegacyCompressedModule = platform === 'node' }: ApplyDumpsOptions,
) {
  const masterKey = moduleOptions?.encryption?.masterKey
  const encryptionEnabled = !!(moduleOptions?.encryption?.enabled && masterKey)

  nitroConfig.publicAssets ||= []
  nitroConfig.alias ||= {}
  nitroConfig.handlers ||= []

  nitroConfig.handlers.push({
    route: '/__nuxt_content/manifest.json',
    handler: resolver.resolve('./runtime/internal/manifest-version-handler'),
  })

  // 1) Expose /_nuxt/content/raw if you want CDN to serve blobs
  if (exposePublicAssets) {
    nitroConfig.publicAssets.push({ dir: join(nitroConfig.buildDir!, 'content', 'raw'), maxAge: 60 })
  }

  // 2) Emit per-collection dump templates (skip private)
  for (const col of manifest.collections) {
    if (col.private) continue
    if (encryptionEnabled) {
      addTemplate(collectionEncryptedDumpTemplate(col.name, manifest, { enabled: true, masterKey }))
    }
    else {
      addTemplate(collectionDumpTemplate(col.name, manifest))
    }
  }

  // 3) Legacy single-file compressed module (node only; backward-compat)
  if (includeLegacyCompressedModule) {
    nitroConfig.alias['#content/dump'] = addTemplate(fullDatabaseCompressedDumpTemplate(manifest)).dst
  }

  // 4) Route handlers: platform-specific handler file, same routes
  const useCloudflareHandler = platform === 'cloudflare' || platform === 'nuxthub'
  const handlerPath
    = useCloudflareHandler
      ? './runtime/presets/cloudflare/database-handler'
      : './runtime/presets/node/database-handler'

  if (!encryptionEnabled) {
    nitroConfig.handlers.push({
      route: '/__nuxt_content/:collection/sql_dump.txt',
      handler: resolver.resolve(handlerPath),
    })
  }
  else {
    nitroConfig.handlers.push(
      // Encrypted dump
      { route: '/__nuxt_content/:collection/sql_dump.enc', handler: resolver.resolve(handlerPath) },
      // Key endpoint
      { route: '/__nuxt_content/:collection/key', handler: resolver.resolve(handlerPath) },
      // Ensure .txt 404s (or handled) while encryption is enabled
      { route: '/__nuxt_content/:collection/sql_dump.txt', handler: resolver.resolve(handlerPath) },

    )
  }
}
