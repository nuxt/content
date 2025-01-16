---
seo:
  title: Meet Studio, content edition for everyone.
  description: Nuxt Studio brings visual editing to your Nuxt Content projects. Anyone can contribute to the website thanks to our versatile editor that adapt to markdown, YAML, or JSON – no technical expertise needed. Built for developers, made for everyone.
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
Meet Studio, content edition :br for everyone.

#description
**Nuxt Studio** brings visual editing to your Nuxt Content projects. Anyone can contribute to the website thanks to our versatile editor that adapt to markdown, YAML, or JSON. No technical expertise needed. *Built for developers, made for everyone.*

#links{unwrap="p"}
  :::u-button
  ---
  label: Get Started for free
  size: xl
  target: _blank
  to: https://nuxt.studio/signin
  trailingIcon: i-lucide-arrow-right
  ---
  :::

  :::u-button
  ---
  color: neutral
  label: Read the documentation
  size: xl
  to: /docs/studio/setup
  variant: subtle
  ---
  :::
::

::u-page-section
#features
  :::u-page-feature
  ---
  icon: i-lucide-circle-user
  ---
  #title{unwrap="p"}
  GitHub & Google Authentication
  
  #description{unwrap="p"}
  Personalized workspace for each role: developers, writers, and clients.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-file-pen
  ---
  #title{unwrap="p"}
  Easy content updates
  
  #description{unwrap="p"}
  From Markdown to YAML edition, our visual editor is designed for non technical users.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-users
  ---
  #title{unwrap="p"}
  Real-time Collaboration
  
  #description{unwrap="p"}
  Write as a team in real-time with our collaboration features.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-sparkles
  ---
  #title{unwrap="p"}
  From Code to Edition
  
  #description{unwrap="p"}
  Developers build the foundation while writers can safely edit the content.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-panels-top-left
  ---
  #title{unwrap="p"}
  Review before publishing
  
  #description{unwrap="p"}
  Review your changes before making them live on your website.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-mouse-pointer-click
  ---
  #title{unwrap="p"}
  Ready-to-use Templates
  
  #description{unwrap="p"}
  Get started quickly with pre-built templates for Saas sites, blogs, docs and more.
  :::
::

::u-page-section
---
orientation: horizontal
---
  :::code-group
  ```vue [components/content/HomeFeature.vue]
  <script setup lang="ts">
    defineProps({
      icon: {
        type: String,
        default: 'i-ph-cursor-click',
      },
    })
  </script>
  
  <template>
    <div class="flex items-start gap-3">
      <div class="flex items-center justify-center border rounded-lg p-1.5">
        <UIcon :name="icon" />
      </div>
      <div class="flex flex-col">
        <h3 class="font-semibold">
          <ContentSlot name="title" />
        </h3>
        <span>
          <ContentSlot name="description" />
        </span>
      </div>
    </div>
  </template>
  ```
  
  ```mdc [content/index.md]
  ::home-feature
    ---
    icon: i-mdi-vuejs
    ---
    #title
    Embedded Vue components
    #description
    Edit slots and props inside the Notion-like editor.
  ::
  ```
  
    ::::preview-card{icon="i-lucide-eye" label="Editor"}
    ![vue component edition on Studio](/docs/studio/home-content-studio-dark.webp)
    ::::
  :::

#title{unwrap="p"}
Developers create the [editing experience]{.text-[var(--ui-primary)]}

#description
Developers build the foundation their way: custom components, media library, and site configuration.

#features
  :::u-page-feature
  ---
  icon: i-lucide-settings-2
  ---
  #title{unwrap="p"}
  Customizable and editable Vue components
  :::

  :::u-page-feature
  ---
  icon: i-simple-icons-markdown
  ---
  #title{unwrap="p"}
  Edit your Markdown with our visual editor
  :::

  :::u-page-feature
  ---
  icon: i-lucide-brush
  ---
  #title{unwrap="p"}
  Edit your app.config visually
  :::

#links
  :::u-button
  ---
  color: neutral
  label: Learn more about custom components
  to: /docs/files/markdown#vue-components
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
:video{autoplay controls loop poster="/assets/home/videos/HomeNotionLikePoster.webp" src="https://res.cloudinary.com/nuxt/video/upload/v1733494722/contentv3final_rc8bvu.mp4"}

 

#title{unwrap="p"}
Let [anyone edit]{.text-[var(--ui-primary)]} your Nuxt Content website

#description
Teams and clients get a powerful visual editor for content management, from text edition to media management - all without touching code.

#features
  :::u-page-feature
  ---
  icon: i-lucide-mouse-pointer-click
  ---
  #title{unwrap="p"}
  Visual editor with drag and drop for Markdown
  :::

  :::u-page-feature
  ---
  icon: i-lucide-file-text
  ---
  #title{unwrap="p"}
  Form generation for `YML` and `JSON` files
  :::

  :::u-page-feature
  ---
  icon: i-lucide-image
  ---
  #title{unwrap="p"}
  Manage all your medias in one place
  :::
::

::u-page-section
---
orientation: horizontal
---
  :::u-color-mode-image
  ---
  class: size-full
  dark: /home/pro-dark.svg
  light: /home/pro-light.svg
  ---
  :::

#title
[Edit together]{.text-[var(--ui-primary)]} , preview instantly

#description
Edit content as a team and see your site come to life with live preview. From text editing to component updates, every change reflects your final website design. Experience seamless content creation without delays or manual refreshes.

#features
  :::u-page-feature
  ---
  icon: i-lucide-files
  ---
  #title{unwrap="p"}
  See your changes in real-time on your website
  :::

  :::u-page-feature
  ---
  icon: i-lucide-link
  ---
  #title{unwrap="p"}
  Share preview URLs to anyone with live updates
  :::

  :::u-page-feature
  ---
  icon: i-lucide-list
  ---
  #title{unwrap="p"}
  Review all your changes before publishing
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
The [best way]{.text-[var(--ui-primary)]} to edit your [Nuxt Content]{.text-[var(--ui-primary)]} website

#links
  :::u-button
  ---
  label: Get started for free
  target: _blank
  to: https://nuxt.studio/signin
  trailingIcon: i-lucide-arrow-right
  ---
  :::

  :::u-button
  ---
  color: neutral
  label: See pricing
  to: /studio/pricing
  variant: outline
  ---
  :::

#description
Import your Nuxt Content website and invite your team to collaborate today.
::
