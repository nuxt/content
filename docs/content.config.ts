import { defineContentConfig, defineCollection, z } from '@nuxt/content'

const createPricingPlanSchema = () => z.object({
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

const createPricingFeatureSchema = () => z.object({
  title: z.string(),
  plans: z.array(z.enum(['solo', 'team', 'unlimited'])).optional(),
  value: z.array(z.string()).optional(),
  soon: z.boolean().optional(),
})

export default defineContentConfig({
  collections: {
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
    docs: defineCollection({
      type: 'page',
      source: {
        include: 'docs/**/*',
      },
      schema: z.object({
        links: z.array(z.object({
          label: z.string(),
          icon: z.string(),
          to: z.string(),
          target: z.string().optional(),
        })).optional(),
      }),
    }),
    pricing: defineCollection({
      type: 'page',
      source: 'studio/pricing.yml',
      schema: z.object({
        onboarding: z.object({
          title: z.string(),
          image: z.object({
            dark: z.string().editor({ input: 'media' }),
            light: z.string().editor({ input: 'media' }),
          }),
        }),
        plans: z.object({
          solo: createPricingPlanSchema(),
          team: createPricingPlanSchema(),
          unlimited: createPricingPlanSchema(),
        }),
        features: z.object({
          title: z.string(),
          description: z.string(),
          includes: z.object({
            projects: createPricingFeatureSchema(),
            members: createPricingFeatureSchema(),
            media: createPricingFeatureSchema(),
            support: createPricingFeatureSchema(),
            dedicated: createPricingFeatureSchema(),
            roles: createPricingFeatureSchema(),
            collaboration: createPricingFeatureSchema(),
            sync: z.object({
              title: z.string(),
              includes: z.object({
                repositories: createPricingFeatureSchema(),
                workflow: createPricingFeatureSchema(),
              }),
            }),
            project: z.object({
              title: z.string(),
              includes: z.object({
                clone: createPricingFeatureSchema(),
                import: createPricingFeatureSchema(),
              }),
            }),
            editors: z.object({
              title: z.string(),
              includes: z.object({
                markdown: createPricingFeatureSchema(),
                json: createPricingFeatureSchema(),
                appconfig: createPricingFeatureSchema(),
                drag: createPricingFeatureSchema(),
              }),
            }),
            preview: z.object({
              title: z.string(),
              includes: z.object({
                draft: createPricingFeatureSchema(),
                branches: createPricingFeatureSchema(),
                prs: createPricingFeatureSchema(),
              }),
            }),
            deploy: z.object({
              title: z.string(),
              includes: z.object({
                gh: createPricingFeatureSchema(),
                self: createPricingFeatureSchema(),
              }),
            }),
            publish: z.object({
              title: z.string(),
              includes: z.object({
                preview: createPricingFeatureSchema(),
                branch: createPricingFeatureSchema(),
                commit: createPricingFeatureSchema(),
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
        slug: z.string().editor({ hidden: true }),
        subtitle: z.string(),
        baseDir: z.string(),
        branch: z.string(),
        category: z.enum(['docs', 'blog', 'minimal', 'saas']),
        demo: z.string(),
        licenseType: z.enum(['nuxt-ui-pro', 'free']),
        mainScreen: z.string().editor({ input: 'media' }),
        name: z.string(),
        owner: z.string(),
        image1: z.string().editor({ input: 'media' }),
        image2: z.string().editor({ input: 'media' }),
        image3: z.string().editor({ input: 'media' }),
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
          src: z.string().editor({ input: 'media' }),
          alt: z.string(),
        }),
      }),
    }),
  },
})
