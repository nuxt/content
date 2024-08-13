import { z, type ZodTypeAny } from 'zod'
import { ContentFileExtension, ContentFileType } from '../types/content'
import { getEnumValues } from './zod'

export const metaSchema = z.object({
  extension: z.enum(getEnumValues(ContentFileExtension)),
  meta: z.object<Record<string, ZodTypeAny>>({
  }),
})

export const pageSchema = z.object({
  stem: z.string(),
  path: z.string(),
  title: z.string(),
  description: z.string(),
  body: z.object({
    type: z.string(),
    children: z.any(),
    toc: z.any(),
  }),
  navigation: z.boolean().default(true),
  raw: z.string(),
})

export const contentSchema = z.object({
  dir: z.string(),
  draft: z.boolean().default(false),
  partial: z.boolean().default(false),
  locale: z.string(),
  type: z.enum(getEnumValues(ContentFileType)),
  source: z.string(),
})
