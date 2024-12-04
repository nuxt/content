---
seo:
  title: The git-based CMS for Nuxt projects.
  description: Nuxt Content is a module for Nuxt that provides a simple way to manage content for your application. It allows developers to write their content in Markdown, YAML, or JSON files and then query and display it in their application.
---

::u-page-hero
#title{unwrap="p"}
The git-based CMS for
<br>
Nuxt projects.

#description
Nuxt Content is a module for Nuxt that provides a simple way to manage content for your application. It allows developers to write their content in Markdown, YAML, or JSON files and then query and display it in their application.

#links{unwrap="p"}
  :::u-button
  ---
  label: Get Started
  trailingIcon: i-lucide-arrow-right
  to: /docs/getting-started/installation
  size: xl
  ---
  :::

  :::u-button
  ---
  label: Open Visual Editor
  to: https://nuxt.studio
  target: _blank
  side: xl
  color: neutral
  variant: subtle
  ---
  :::

#default
  :::div{class="hidden sm:block"}
    ::::u-color-mode-image
    ---
    dark: /home/hero-dark.svg
    light: /home/hero-light.svg
    class: size-full absolute bottom-0 inset-x-4 z-[-1]
    ---
    ::::
  :::
::

::u-page-section
#features
  :::u-page-card{inline variant="naked" icon="i-lucide-files"}
  #title{unwrap="p"}
  File-based CMS
  #description{unwrap="p"}
  Write your content in Markdown, YML, CSV or JSON and query it in your components.
  :::

  :::u-page-card{inline variant="naked" icon="i-lucide-filter"}
  #title{unwrap="p"}
  Query Builder
  #description{unwrap="p"}
  Query your content with a MongoDB-like API to fetch the right data at the right time.
  :::

  :::u-page-card{inline variant="naked" icon="i-lucide-database"}
  #title{unwrap="p"}
  SQLite powered
  #description{unwrap="p"}
  Add custom fields to your content, making it suitable for various types of projects.
  :::

  :::u-page-card{inline variant="naked" icon="i-simple-icons-markdown"}
  #title{unwrap="p"}
  Markdown with Vue
  #description{unwrap="p"}
  Use Vue components in Markdown files, with props, slots and nested components.
  :::

  :::u-page-card{inline variant="naked" icon="i-lucide-list-minus"}
  #title{unwrap="p"}
  Code highlighting
  #description{unwrap="p"}
  Display beautiful code blocks on your website with the Shiki integration supporting VS Code themes.
  :::

  :::u-page-card{inline variant="naked" icon="i-lucide-mouse-pointer-click"}
  #title{unwrap="p"}
  Visual Editor
  #description{unwrap="p"}
  Let your team edit your Nuxt Content project with Nuxt Studio, our visual editor.
  :::

  :::u-page-card{inline variant="naked" icon="i-lucide-panel-left"}
  #title{unwrap="p"}
  Navigation Generation
  #description{unwrap="p"}
  Customize HTML typography tags with Vue components to give your content a consistent style.
  :::

  :::u-page-card{inline variant="naked" icon="i-lucide-heading-1"}
  #title{unwrap="p"}
  Prose Components
  #description{unwrap="p"}
  Nuxt Content works on all hosting providers, static, server, serverless & edge.
  :::

  :::u-page-card{inline variant="naked" icon="i-lucide-globe"}
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

:::div{class="hidden sm:block"}
  ::::u-color-mode-image
  ---
  dark: /home/features-dark.svg
  light: /home/features-light.svg
  class: size-full absolute top-0 inset-x-4
  ---
  ::::
:::
::

::u-page-section{orientation="horizontal" reverse}
#title
Markdown meets [Vue]{class="text-[var(--ui-primary)]"}

#description
We created the MDC syntax to let you use Vue components with props and slots inside your Markdown files.

#features
  :::u-page-card{inline variant="naked" icon="i-lucide-list"}
  #title{unwrap="p"}
  Specify props with frontmatter syntax
  :::

  :::u-page-card{inline variant="naked" icon="i-lucide-hash"}
  #title{unwrap="p"}
  Use components slots with `#`
  :::

  :::u-page-card{inline variant="naked" icon="i-lucide-code-xml"}
  #title{unwrap="p"}
  Add any other html attributes
  :::

#links
  :::u-button
  ---
  label: Learn more about MDC
  to: /docs/files/markdown#mdc-syntax
  trailingIcon: i-lucide-arrow-right
  color: neutral
  variant: subtle
  ---
  :::

#default
  :::code-group
    ::::preview-card{label="Preview" icon="i-lucide-eye" class="!h-[458px]"}
      :::::example-landing-hero{class="!h-[458px]"}
      ---
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
::

::u-page-section{orientation="horizontal"}
#title
Query with [Type-Safety]{class="text-[var(--ui-secondary)]"}

#description
Define your content structure with collections and query them with schema validation and full type-safety.

#features
  :::u-page-card{inline variant="naked" icon="i-lucide-layout-grid"}
  #title{unwrap="p"}
  Create collections for similar content files
  :::

  :::u-page-card{inline variant="naked" icon="i-lucide-circle-check"}
  #title{unwrap="p"}
  Define schema for the collection front matter
  :::

  :::u-page-card{inline variant="naked" icon="i-lucide-text-cursor"}
  #title{unwrap="p"}
  Get auto-completion in your Vue files
  :::

#links
  :::u-button
  ---
  label: Learn more about content collections
  to: /docs/collections/collections
  trailingIcon: i-lucide-arrow-right
  color: neutral
  variant: subtle
  ---
  :::

#default
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
    import { defineCollection, z } from '@nuxt/content'

    export const collections = {
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
    ```
  :::
::

::u-page-section{orientation="horizontal" reverse}
#title
Make changes [like a pro]{class="text-[var(--ui-primary)]"}

#description
Edit your Nuxt Content website with our Notion-like Markdown editor with live preview and online collaboration.

#features
  :::u-page-card{inline variant="naked" icon="i-simple-icons-github"}
  #title{unwrap="p"}
  Commit & push to GitHub with one click
  :::

  :::u-page-card{inline variant="naked" icon="i-simple-icons-google"}
  #title{unwrap="p"}
  Invite editors to login with Google and publish changes
  :::

  :::u-page-card{inline variant="naked" icon="i-lucide-users"}
  #title{unwrap="p"}
  Edit the content in real-time with your team
  :::

#links
  :::u-button
  ---
  label: Discover the Nuxt Content Editor
  to: https://nuxt.studio
  trailingIcon: i-lucide-arrow-right
  color: neutral
  ---
  :::

#default
  :::u-color-mode-image
  ---
  dark: /home/pro-dark.svg
  light: /home/pro-light.svg
  class: size-full
  ---
::

::u-page-section
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
  label: Open Studio
  to: https://nuxt.studio
  target: _blank
  color: neutral
  variant: outline
  ---
  :::

#default
  :::div{class="hidden sm:block"}
    ::::u-color-mode-image
    ---
    dark: /home/cta-dark.svg
    light: /home/cta-light.svg
    class: size-full absolute bottom-0 inset-x-4 z-[-1]
    ---
    ::::
  :::
::
