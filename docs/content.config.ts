import { defineCollection, z } from '@nuxt/content'

export const collections = {
  docs: defineCollection({
    type: 'page',
    source: 'docs/**',
    schema: z.object({
      links: z.array(z.object({
        label: z.string(),
        icon: z.string(),
        avatar: z.object({
          src: z.string(),
          alt: z.string(),
        }).optional(),
        to: z.string(),
        target: z.string().optional(),
      })).optional(),
    }),
  }),
  home: defineCollection({
    type: 'page',
    source: 'index.yml',
    schema: z.object({
      hero: z.object({
        title: z.string(),
        description: z.string(),
        links: z.array(z.object({
          label: z.string(),
          icon: z.string(),
          to: z.string(),
        })).optional(),
        image: z.object({
          dark: z.string(),
          light: z.string(),
        }).optional(),
      }).optional(),
      sections: z.array(z.object({
        title: z.string(),
        description: z.string().optional(),
        class: z.string().optional(),
        code: z.string().optional(),
        ui: z.object({}).optional(),
        features: z.array(z.object({
          icon: z.string().optional(),
          title: z.string().optional(),
          description: z.string().optional(),
        })).optional(),
        links: z.array(z.object({
          label: z.string(),
          icon: z.string(),
          to: z.string(),
        })).optional(),
        image: z.object({
          dark: z.string(),
          light: z.string(),
        }).optional(),
      })).optional(),
    }),
  }),
}
