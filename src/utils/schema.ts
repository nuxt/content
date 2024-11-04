import { z } from 'zod'
import { ContentFileExtension } from '../types/content'
import { getEnumValues } from './zod'

export const metaSchema = z.object({
  _id: z.string(),
  stem: z.string(),
  extension: z.enum(getEnumValues(ContentFileExtension)),
  meta: z.record(z.string(), z.any()),
})

export const pageSchema = z.object({
  path: z.string(),
  title: z.string(),
  description: z.string(),
  seo: z.intersection(
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      meta: z.array(z.record(z.string(), z.any())).optional(),
      link: z.array(z.record(z.string(), z.any())).optional(),
    }),
    z.record(z.string(), z.any()),
  ).optional().default({}),
  body: z.object({
    type: z.string(),
    children: z.any(),
    toc: z.any(),
  }),
  navigation: z.union([
    z.boolean(),
    z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string(),
    }),
  ]).default(true),
})
