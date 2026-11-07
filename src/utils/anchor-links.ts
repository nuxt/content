import { hasNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'
import type { Nuxt } from 'nuxt/schema'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

/**
 * Nuxt Content v3 `content.renderer.anchorLinks` option.
 * @see https://content.nuxt.com/docs/getting-started/configuration#anchorlinks
 */
export type AnchorLinksOptions = boolean | Partial<Record<HeadingTag, boolean>>

const HEADING_TAGS: HeadingTag[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

/**
 * Heading tags that link to themselves. An object is merged with v3's default
 * (`h2` to `h4`), as v3's module defaults were.
 */
export function resolveAnchorLinks(anchorLinks: AnchorLinksOptions | undefined): HeadingTag[] {
  if (typeof anchorLinks === 'boolean') return anchorLinks ? [...HEADING_TAGS] : []
  const enabled: Partial<Record<HeadingTag, boolean>> = { h2: true, h3: true, h4: true, ...anchorLinks }
  return HEADING_TAGS.filter(tag => enabled[tag])
}

/**
 * Heading tags the `heading-links` plugin links, exposed to the runtime as `import.meta.content.anchorLinks`.
 *
 * Nuxt UI's `Prose*` heading components add the links themselves, as `@nuxtjs/mdc`'s did in v3,
 * when `runtimeConfig.public.mdc.headings.anchorLinks` allows it. With Nuxt UI, that config is set
 * instead and no tag is returned, so links aren't nested.
 */
export function setupAnchorLinks(anchorLinks: AnchorLinksOptions | undefined, nuxt: Nuxt): HeadingTag[] {
  const tags = resolveAnchorLinks(anchorLinks)
  if (!hasNuxtModule('@nuxt/ui', nuxt)) return tags

  nuxt.options.runtimeConfig.public.mdc = defu(nuxt.options.runtimeConfig.public.mdc as Record<string, unknown> | undefined, {
    headings: { anchorLinks: Object.fromEntries(HEADING_TAGS.map(tag => [tag, tags.includes(tag)])) },
  })
  return []
}
