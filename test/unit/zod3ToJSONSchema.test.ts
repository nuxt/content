import { describe, expect, test } from 'vitest'
import { z, toJSONSchema } from '../../src/utils/schema/zod3'

describe('zod3 toJSONSchema', () => {
  test('keeps editor metadata on top-level fields', () => {
    const schema = z.object({
      title: z.string().editor({ label: 'Page title' }),
    })

    const { properties } = toJSONSchema(schema, '__SCHEMA__').definitions.__SCHEMA__

    expect(properties.title).toMatchObject({
      type: 'string',
      $content: { editor: { label: 'Page title' } },
    })
  })

  test('keeps editor metadata on fields nested in a labelled object', () => {
    const schema = z.object({
      hero: z.object({
        lede: z.string().editor({ label: 'Intro text' }),
        image: z.string().editor({ label: 'Image', input: 'media' }),
      }).editor({ label: 'Top of the page' }),
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hero = toJSONSchema(schema, '__SCHEMA__').definitions.__SCHEMA__.properties.hero as any

    expect(hero.$content).toEqual({ editor: { label: 'Top of the page' } })
    expect(hero.properties.lede).toMatchObject({
      type: 'string',
      $content: { editor: { label: 'Intro text' } },
    })
    expect(hero.properties.image).toMatchObject({
      type: 'string',
      $content: { editor: { label: 'Image', input: 'media' } },
    })
  })

  test('keeps editor metadata on fields nested in a labelled array of objects', () => {
    const schema = z.object({
      features: z.array(
        z.object({
          heading: z.string().editor({ label: 'Heading' }),
        }).editor({ label: 'Feature' }),
      ).editor({ label: 'Features' }),
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const features = toJSONSchema(schema, '__SCHEMA__').definitions.__SCHEMA__.properties.features as any

    expect(features.type).toBe('array')
    expect(features.$content).toEqual({ editor: { label: 'Features' } })
    expect(features.items.$content).toEqual({ editor: { label: 'Feature' } })
    expect(features.items.properties.heading).toMatchObject({
      type: 'string',
      $content: { editor: { label: 'Heading' } },
    })
  })
})
