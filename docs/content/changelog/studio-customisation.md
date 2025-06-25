---
name: Studio Frontmatter Customization
title: Studio Form Customisation
description: Studio forms are dynamically generated based on the collection
  schema defined in your content configuration file.
date: 2025-02-20T01:00:00.000Z
image:
  src: /blog/studio-form-generation.png
  alt: Frontmatter form generation based on collection schema
authors:
  - name: Baptiste Leproux
    to: https://x.com/_larbish
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
category: content
draft: false
---

The [Studio](https://nuxt.studio) forms are dynamically generated based on the collection schema defined in your content configuration file. This behaviour applies whether you’re editing the [frontmatter](/docs/files/markdown#frontmatter) of a `Markdown` file or a `JSON` / `YAML` file.

:video{autoplay controls poster="https://res.cloudinary.com/nuxt/video/upload/v1739982761/frontmatterform_yjafgt.png" src="https://res.cloudinary.com/nuxt/video/upload/v1739982761/frontmatterform_yjafgt.mp4"}

## **Defining your form with** `zod` Schema

Nuxt Content leverages [zod](https://github.com/colinhacks/zod) to let you define a type-safe schema for your content. This schema not only validates your data but also powers the form generation in **Studio**.

### **Built-in zod Helpers**

You can define your Content schema by adding the `schema` property to your collection and by using a [zod](https://github.com/colinhacks/zod) schema.

`@nuxt/content` exposes a `z` object that contains a set of [Zod](/) utilities for common data types.

::prose-code-group
```ts [content.config.ts]
export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        draft: z.boolean().default(false),
        category: z.enum(['Alps', 'Himalaya', 'Pyrenees']).optional(),
        date: z.date(),
        image: z.object({
          src: z.string().editor({ input: 'media' }),
          alt: z.string(),
        }),
        slug: z.string().editor({ hidden: true }),
        icon: z.string().optional().editor({ input: 'icon' }),
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
      }),
    }),
  },
})    
```

  :::code-preview{icon="i-lucide-eye" label="Generated Form"}
  ![Form preview](/docs/studio/preview-schema.png)
  :::
::

### **Native Inputs Mapping**

Primitive Zod types are automatically mapped to appropriate form inputs in **Studio**:

- **String** → Text input
- **Date** → Date picker
- **Number** → Number input (counter)
- **Boolean** → Toggle switch
- **Enum** → Select dropdown
- **Arrays of strings** → List of badge inputs
- **Arrays of objects** → Accordion of items with embedded form

:video{autoplay controls loop poster="https://res.cloudinary.com/nuxt/video/upload/v1740679550/arrayobjectandstring_r1jpvz.jpg" src="https://res.cloudinary.com/nuxt/video/upload/v1740679550/arrayobjectandstring_r1jpvz.mp4"}

### Custom Inputs Mapping

Content goes beyond primitive types. You can customise form fields using the `editor` method, which extends Zod types with metadata to empower editor interface.

This allows you to define custom inputs or hide fields.

#### Usage

```ts [content.config.ts]
mainScreen: z.string().editor({ input: 'media' })
```

#### Options

##### `input: 'media' | 'icon'`

You can set the editor input type. Currently both icon and media are available since there are handled in Studio editor.

##### `hidden: Boolean`

This option can be set to avoid the display of a field in the Studio editor.

::prose-tip
Studio inputs are fully extensible. We can create as many input as we want based on our users needs.
::
