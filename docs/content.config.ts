import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
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
    landing: defineCollection({
      type: 'page',
      source: [{
        include: 'index.md',
      }, {
        include: 'blog.yml',
      }, {
        include: 'changelog.yml',
      }, {
        include: 'studio/index.md',
      }, {
        include: 'studio/templates.yml',
      }],
    }),
    templates: defineCollection({
      type: 'page',
      source: 'studio/templates/*.md',
      schema: z.object({
        slug: z.string(),
        subtitle: z.string(),
        baseDir: z.string(),
        branch: z.string(),
        category: z.enum(['docs', 'blog', 'minimal', 'saas']),
        demo: z.string(),
        licenseType: z.enum(['nuxt-ui-pro', 'free']),
        mainScreen: z.string(),
        name: z.string(),
        owner: z.string(),
        image1: z.string(),
        image2: z.string(),
        image3: z.string(),
      }),
    }),
    posts: defineCollection({
      type: 'page',
      source: [{ include: 'blog/*.md' }, { include: 'changelog/*.md' }],
      schema: z.object({
        authors: z.array(z.object({
          slug: z.string(),
          name: z.string(),
          to: z.string(),
          avatar: z.object({
            src: z.string(),
            alt: z.string(),
          }),
        })),
        date: z.date(),
        image: z.object({
          src: z.string(),
          alt: z.string(),
        }),
        badge: z.object({
          label: z.string(),
          color: z.enum(['error', 'primary', 'neutral', 'secondary', 'success', 'info', 'warning']),
        }),
      }),
    }),
  },
})
