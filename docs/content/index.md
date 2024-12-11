---
seo:
  title: The git-based CMS for Nuxt projects.
  description: Nuxt Content is a module for Nuxt that provides a simple way to
    manage content for your application. It allows developers to write their
    content in Markdown, YAML, or JSON files and then query and display it in
    their application.
---

::u-page-hero
  :::div{.hidden.sm:block}
    ::::u-color-mode-image
    ---
    class: size-full absolute bottom-0 inset-x-4 z-[-1]
    dark: /home/hero-dark.svg
    light: /home/hero-light.svg
    ---
    ::::
  :::

#title{unwrap="p"}
The git-based CMS for :br Nuxt projects.

#description
Nuxt Content is a module for Nuxt that provides a simple way to manage content for your application. It allows developers to write their content in Markdown, YAML, or JSON files and then query and display it in their application.

#links{unwrap="p"}
  :::u-button
  ---
  label: Get Started
  size: xl
  to: /docs/getting-started/installation
  trailingIcon: i-lucide-arrow-right
  ---
  :::

  :::u-button
  ---
  color: neutral
  label: Open Visual Editor
  size: xl
  target: _blank
  to: https://nuxt.studio
  variant: subtle
  ---
  :::
::

::u-page-section
#features
  :::u-page-card
  ---
  inline: true
  icon: i-lucide-files
  variant: naked
  ---
  #title{unwrap="p"}
  File-based CMS
  
  #description{unwrap="p"}
  Write your content in Markdown, YML, CSV or JSON and query it in your components.
  :::

  :::u-page-card
  ---
  inline: true
  icon: i-lucide-filter
  variant: naked
  ---
  #title{unwrap="p"}
  Query Builder
  
  #description{unwrap="p"}
  Query your content with a MongoDB-like API to fetch the right data at the right time.
  :::

  :::u-page-card
  ---
  inline: true
  icon: i-lucide-database
  variant: naked
  ---
  #title{unwrap="p"}
  SQLite powered
  
  #description{unwrap="p"}
  Add custom fields to your content, making it suitable for various types of projects.
  :::

  :::u-page-card
  ---
  inline: true
  icon: i-simple-icons-markdown
  variant: naked
  ---
  #title{unwrap="p"}
  Markdown with Vue
  
  #description{unwrap="p"}
  Use Vue components in Markdown files, with props, slots and nested components.
  :::

  :::u-page-card
  ---
  inline: true
  icon: i-lucide-list-minus
  variant: naked
  ---
  #title{unwrap="p"}
  Code highlighting
  
  #description{unwrap="p"}
  Display beautiful code blocks on your website with the Shiki integration supporting VS Code themes.
  :::

  :::u-page-card
  ---
  inline: true
  icon: i-lucide-mouse-pointer-click
  variant: naked
  ---
  #title{unwrap="p"}
  Visual Editor
  
  #description{unwrap="p"}
  Let your team edit your Nuxt Content project with Nuxt Studio, our visual editor.
  :::

  :::u-page-card
  ---
  inline: true
  icon: i-lucide-panel-left
  variant: naked
  ---
  #title{unwrap="p"}
  Navigation Generation
  
  #description{unwrap="p"}
  Customize HTML typography tags with Vue components to give your content a consistent style.
  :::

  :::u-page-card
  ---
  inline: true
  icon: i-lucide-heading-1
  variant: naked
  ---
  #title{unwrap="p"}
  Prose Components
  
  #description{unwrap="p"}
  Nuxt Content works on all hosting providers, static, server, serverless & edge.
  :::

  :::u-page-card
  ---
  inline: true
  icon: i-lucide-globe
  variant: naked
  ---
  #title{unwrap="p"}
  Deploy everywhere
  
  #description{unwrap="p"}
  Generate a structured object from your content files and display a navigation menu in minutes.
  :::
::

::u-page-section
#title
Everything you need for content management

#description
Combine file-based simplicity with Vue component power. Build content-rich websites, from documentation pages to complex applications.

  :::div{.hidden.sm:block}
    ::::u-color-mode-image
    ---
    class: size-full absolute top-0 inset-x-4
    dark: /home/features-dark.svg
    light: /home/features-light.svg
    ---
    ::::
  :::
::

::u-page-section
---
reverse: true
orientation: horizontal
---
  :::code-group
    ::::preview-card{.!h-[458px] icon="i-lucide-eye" label="Preview"}
      :::::example-landing-hero
      ---
      class: "!h-[458px]"
      image: /images/everest.jpg
      ---
      #title
      The Everest.
      
      #description
      The Everest is the highest mountain in the world, standing at 8,848 meters above sea level.
      :::::
    ::::
  
  ```mdc [content/index.md]
  ---
  title: The Mountains Website
  description: A website about the most iconic mountains in the world.
  ---
  
  ::landing-hero
  ---
  image: /images/everest.png
  ---
  #title
  The Everest.
  
  #description
  The Everest is the highest mountain in the world, standing at 8,848 meters above sea level.
  ::
  ```
  
  ```vue [components/LandingHero.vue]
  <script setup lang="ts">
  defineProps<{ image: string }>()
  </script>
  
  <template>
    <section class="flex flex-col sm:flex-row sm:items-center flex-col-reverse gap-4 py-8 sm:gap-12 sm:py-12">
      <div>
        <h1 class="text-4xl font-semibold">
          <slot name="title" />
        </h1>
        <div class="text-base text-gray-600 dark:text-gray-300">
          <slot name="description" />
        </div>
      </div>
      <img :src="image" class="w-1/2 rounded-lg">
    </section>
  </template>
  ```
  :::

#title
Markdown meets [Vue]{.text-[var(--ui-primary)]} components

#description
We created the MDC syntax to let you use Vue components with props and slots inside your Markdown files.

#features
  :::u-page-card
  ---
  inline: true
  icon: i-lucide-list
  variant: naked
  ---
  #title{unwrap="p"}
  Specify props with frontmatter syntax
  :::

  :::u-page-card
  ---
  inline: true
  icon: i-lucide-hash
  variant: naked
  ---
  #title{unwrap="p"}
  Use components slots with `#`
  :::

  :::u-page-card
  ---
  inline: true
  icon: i-lucide-code-xml
  variant: naked
  ---
  #title{unwrap="p"}
  Add any other html attributes
  :::

#links
  :::u-button
  ---
  color: neutral
  label: Learn more about MDC
  to: /docs/files/markdown#mdc-syntax
  trailingIcon: i-lucide-arrow-right
  variant: subtle
  ---
  :::
::

::u-page-section
---
orientation: horizontal
---
  :::code-group
  ```vue [pages/blog.vue]
  <script setup lang="ts">
  const { data: posts } = await useAsyncData('blog', () => {
    return queryCollection('blog').all()
  })
  </script>
  
  <template>
    <div>
      <h1>Blog</h1>
      <ul>
        <li v-for="post in posts" :key="post.id">
          <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
        </li>
      </ul>
    </div>
  </template>
  ```
  
  ```ts [content.config.ts]
  import { defineContentConfig, defineCollection, z } from '@nuxt/content'
  
  export default defineContentConfig({
    collections: {
      blog: defineCollection({
        source: 'blog/*.md',
        type: 'page',
        // Define custom schema for docs collection
        schema: z.object({
          tags: z.array(z.string()),
          image: z.string(),
          date: z.Date()
        })
      })
    }
  })
  ```
  :::

#title
Query with [Type-Safety]{.text-[var(--ui-secondary)]}

#description
Define your content structure with collections and query them with schema validation and full type-safety.

#features
  :::u-page-card
  ---
  inline: true
  icon: i-lucide-layout-grid
  variant: naked
  ---
  #title{unwrap="p"}
  Create collections for similar content files
  :::

  :::u-page-card
  ---
  inline: true
  icon: i-lucide-circle-check
  variant: naked
  ---
  #title{unwrap="p"}
  Define schema for the collection front matter
  :::

  :::u-page-card
  ---
  inline: true
  icon: i-lucide-text-cursor
  variant: naked
  ---
  #title{unwrap="p"}
  Get auto-completion in your Vue files
  :::

#links
  :::u-button
  ---
  color: neutral
  label: Learn more about content collections
  to: /docs/collections/collections
  trailingIcon: i-lucide-arrow-right
  variant: subtle
  ---
  :::
::

::u-page-section
---
reverse: true
orientation: horizontal
---
:video{autoplay controls loop src="https://res.cloudinary.com/nuxt/video/upload/v1733494722/contentv3final_rc8bvu.mp4"}

 
#title{unwrap="p"}
Let [anyone edit]{.text-[var(--ui-primary)]} your website

#description
Edit your Nuxt Content website with **Studio**, our CMS platform with Notion-like Markdown editors and generated forms for `YAML` and `JSON` files. Live preview and online collaboration included.

#features
  :::u-page-card
  ---
  inline: true
  icon: i-lucide-mouse-pointer-click
  variant: naked
  ---
  #title{unwrap="p"}
  Visual editor with drag and drop for Markdown
  :::

  :::u-page-card
  ---
  inline: true
  icon: i-lucide-file-text
  variant: naked
  ---
  #title{unwrap="p"}
  Form generation for YML and JSON files
  :::

  :::u-page-card
  ---
  inline: true
  icon: i-simple-icons-google
  variant: naked
  ---
  #title{unwrap="p"}
  Invite editors to login with Google and let them publish their changes
  :::

#links
  :::u-button
  ---
  color: neutral
  label: Discover Studio
  to: /studio
  trailingIcon: i-lucide-arrow-right
  ---
  :::
::

::u-page-section
  :::div{.hidden.sm:block}
    ::::u-color-mode-image
    ---
    class: size-full absolute bottom-0 inset-x-4 z-[-1]
    dark: /home/cta-dark.svg
    light: /home/cta-light.svg
    ---
    ::::
  :::

#title
Add a git-based CMS to your Nuxt project.

#links
  :::u-button
  ---
  label: Start reading docs
  to: /docs/getting-started/installation
  trailingIcon: i-lucide-arrow-right
  ---
  :::

  :::u-button
  ---
  color: neutral
  label: Open Studio
  target: _blank
  to: https://nuxt.studio
  variant: outline
  ---
  :::
::
