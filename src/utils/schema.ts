import { z, type ZodTypeAny } from 'zod'
import { ContentFileExtension, ContentFileType } from '../types/content'
import { getEnumValues } from './zod'

export const metaSchema = z.object({
  id: z.string(),
  weight: z.string(),
  stem: z.string(),
  extension: z.enum(getEnumValues(ContentFileExtension)),
  meta: z.object<Record<string, ZodTypeAny>>({
  }),
})

export const pageSchema = z.object({
  path: z.string(),
  title: z.string(),
  description: z.string(),
  seo: z.intersection(
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    }),
    z.record(z.string(), z.any()),
  ).optional(),
  body: z.object({
    type: z.string(),
    children: z.any(),
    toc: z.any(),
  }),
  navigation: z.boolean().default(true),
})

// TODO
export const contentSchema = z.object({
  dir: z.string(),
  draft: z.boolean().default(false),
  partial: z.boolean().default(false),
  locale: z.string(),
  type: z.enum(getEnumValues(ContentFileType)),
  source: z.string(),
})
