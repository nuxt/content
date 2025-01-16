import { defineContentConfig, defineCollection, z } from '@nuxt/content'

const pricingPlan = z.object({
  title: z.string(),
  description: z.string(),
  price: z.string(),
  cycle: z.string().optional(),
  features: z.array(z.string()),
  badge: z.string().optional(),
  hightlight: z.boolean().optional(),
  button: z.object({
    label: z.string(),
    color: z.enum(['error', 'primary', 'neutral', 'secondary', 'success', 'info', 'warning']),
    to: z.string(),
    target: z.string().optional(),
  }),
})

const pricingFeature = z.object({
  title: z.string(),
  plans: z.array(z.enum(['solo', 'team', 'unlimited'])).optional(),
  value: z.array(z.string()).optional(),
  soon: z.boolean().optional(),
})

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
        include: 'templates.yml',
      }],
    }),
    pricing: defineCollection({
      type: 'page',
      source: 'studio/pricing.yml',
      schema: z.object({
        onboarding: z.object({
          title: z.string(),
          image: z.object({
            dark: z.string(),
            light: z.string(),
          }),
        }),
        plans: z.object({
          solo: pricingPlan,
          team: pricingPlan,
          unlimited: pricingPlan,
        }),
        features: z.object({
          title: z.string(),
          description: z.string(),
          includes: z.object({
            projects: pricingFeature,
            members: pricingFeature,
            media: pricingFeature,
            support: pricingFeature,
            dedicated: pricingFeature,
            roles: pricingFeature,
            collaboration: pricingFeature,
            sync: z.object({
              title: z.string(),
              includes: z.object({
                repositories: pricingFeature,
                workflow: pricingFeature,
              }),
            }),
            project: z.object({
              title: z.string(),
              includes: z.object({
                clone: pricingFeature,
                import: pricingFeature,
              }),
            }),
            editors: z.object({
              title: z.string(),
              includes: z.object({
                markdown: pricingFeature,
                json: pricingFeature,
                appconfig: pricingFeature,
                drag: pricingFeature,
              }),
            }),
            preview: z.object({
              title: z.string(),
              includes: z.object({
                draft: pricingFeature,
                branches: pricingFeature,
                prs: pricingFeature,
              }),
            }),
            deploy: z.object({
              title: z.string(),
              includes: z.object({
                gh: pricingFeature,
                self: pricingFeature,
              }),
            }),
            publish: z.object({
              title: z.string(),
              includes: z.object({
                preview: pricingFeature,
                branch: pricingFeature,
                commit: pricingFeature,
              }),
            }),
          }),
        }),
      }),
    }),
    templates: defineCollection({
      type: 'page',
      source: 'templates/*.md',
      schema: z.object({
        draft: z.boolean().default(false),
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
        draft: z.boolean().default(false),
        authors: z.array(z.object({
          slug: z.string(),
          username: z.string(),
          name: z.string(),
          to: z.string(),
          avatar: z.object({
            src: z.string(),
            alt: z.string(),
          }),
        })),
        category: z.enum(['studio', 'content']).optional(),
        date: z.date(),
        image: z.object({
          src: z.string(),
          alt: z.string(),
        }),
      }),
    }),
  },
})
