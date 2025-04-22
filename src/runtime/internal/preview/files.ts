import { dirname, parse, join } from 'pathe'
import { withoutLeadingSlash, withLeadingSlash } from 'ufo'
import type { DraftFile, DraftSyncFile } from '~/src/types/preview'

export const PreviewConfigFiles = {
  appConfig: 'app.config.ts',
  appConfigV4: 'app/app.config.ts',
  nuxtConfig: 'nuxt.config.ts',
}

// Removing `content/` prefix only if path is starting with content/
export function withoutRoot(path: string) {
  return path?.startsWith('content/') ? path.split('/').slice(1).join('/') : withoutLeadingSlash(path)
}

// Remove leading number from path
export function withoutPrefixNumber(path: string, leadingSlash = false) {
  if (!path) {
    return path
  }

  return leadingSlash ? withLeadingSlash(path.replace(/\/\d+\./, '/')) : withoutLeadingSlash(path.replace(/^\d+\./, ''))
}

// Generate stem (path without extension)
export function generateStemFromPath(path: string) {
  const pathWithoutRoot = withoutRoot(path)

  return join(dirname(pathWithoutRoot), parse(pathWithoutRoot).name)
}

export function mergeDraft(dbFiles: DraftSyncFile[] = [], draftAdditions: DraftFile[], draftDeletions: DraftFile[]) {
  const additions = [...(draftAdditions || [])]
  const deletions = [...(draftDeletions || [])]

  // Compute file name
  const mergedFiles: DraftSyncFile[] = JSON.parse(JSON.stringify(dbFiles))

  // Merge draft additions
  for (const addition of additions) {
    // File is new
    if (addition.new) {
      mergedFiles.push({ path: addition.path, parsed: addition.parsed })
    }
    // File has been renamed
    else if (addition.oldPath) {
      // Remove old file from deletions (only display renamed one)
      deletions.splice(deletions.findIndex(d => d.path === addition.oldPath), 1)

      // Custom case of #447
      const oldPathExistInCache = additions.find(a => a.path === addition.oldPath)
      if (oldPathExistInCache) {
        mergedFiles.push({ path: addition.path, parsed: addition.parsed })
        // Update existing renamed file data
      }
      else {
        const file = mergedFiles.find(f => f.path === addition.oldPath)
        if (file) {
          file.path = addition.path

          // If file is also modified, set draft content
          if (addition.parsed) {
            file.parsed = addition.parsed
          }
          else if (addition.pathMeta) {
            // Apply new path metadata
            ['_file', '_path', '_id', '_locale'].forEach((key) => {
              file.parsed![key] = addition.pathMeta![key]
            })
          }
        }
      }
      // File has been added
    }
    // File has been modified
    else {
      const file = mergedFiles.find(f => f.path === addition.path)
      if (file) {
        Object.assign(file, { path: addition.path, parsed: addition.parsed })
      }
      else {
        mergedFiles.push({ path: addition.path, parsed: addition.parsed })
      }
    }
  }

  // Merge draft deletions (set deletion status)
  for (const deletion of deletions) {
    // File has been deleted
    mergedFiles.splice(mergedFiles.findIndex(f => f.path === deletion.path), 1)
  }

  const comperable = new Intl.Collator(undefined, { numeric: true })
  mergedFiles.sort((a, b) => comperable.compare(a.path, b.path))

  return mergedFiles
}
