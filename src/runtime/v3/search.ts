import { splitIntoSections } from '@comark/cms/plugins/sqlite-full-text-search'
import type { CMSFile } from '@comark/cms'

/**
 * A single searchable section extracted from a document — the page itself plus
 * one entry per heading within the configured level range.
 */
export type Section = ReturnType<typeof splitIntoSections>[number]

type HeadingTag = `h${1 | 2 | 3 | 4 | 5 | 6}`

export interface GenerateSearchSectionsOptions {
  /** Tags whose text is skipped when collecting a section's content (e.g. `['code', 'pre']`). */
  ignoredTags?: string[]
  /** Document data fields copied onto every section generated from that document. */
  extraFields?: Array<string | number | symbol>
  /** Lowest heading level that starts a new section. @default 'h1' */
  minHeading?: HeadingTag
  /** Highest heading level that starts a new section. @default 'h6' */
  maxHeading?: HeadingTag
}

const HEADING = /^h([1-6])$/
function headingLevel(tag: string, fallback: number) {
  const match = tag.match(HEADING)
  return match ? Number(match[1]) : fallback
}

function pick(obj: Record<string, unknown>, keys: string[]) {
  const result: Record<string, unknown> = {}
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}

/**
 * Split each document's parsed body into flat, searchable sections.
 * `documents` must be full {@link CMSFile}s (with `nodes`); fetch them with
 * `cms.get()` — the lightweight items returned by `query().all()` have no body.
 */
export function generateSearchSections(
  documents: CMSFile[],
  opts?: GenerateSearchSectionsOptions,
): Array<Section & Record<string, unknown>> {
  const { ignoredTags = [], extraFields = [], minHeading = 'h1', maxHeading = 'h6' } = opts || {}
  const ignored = new Set(ignoredTags)
  const minLevel = headingLevel(minHeading, 1)
  const maxLevel = headingLevel(maxHeading, 6)
  const fields = extraFields.map(String)

  return documents.flatMap((doc) => {
    const extra = pick((doc.data ?? {}) as Record<string, unknown>, fields)
    return splitIntoSections(doc, { ignoredTags: ignored, minLevel, maxLevel })
      .map(section => ({ ...extra, ...section }))
  })
}
