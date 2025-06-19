---
title: Behind the scenes of Nuxt Studio's visual editor
description: Discover the inner workings of Nuxt Studio's visual editor and how it interprets the Markdown syntax and generate it back.
image:
  src: /blog/visual-editor.webp
authors:
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
    username: larbish
  - name: Ferdinand Coumau
    avatar:
      src: https://avatars.githubusercontent.com/u/98885012?v=4
    to: https://x.com/CoumauFerdinand
    username: CoumauFerdinand
date: 2024-09-04T00:00:00.000Z
category: studio
---

## **Introduction**

Nuxt Studio offers a versatile workspace for both developers and content writers, giving them the freedom to choose between two distinct editors for content creation and management: the Markdown editor and the Visual editor.

![Select your favorit editor from the project settings](/blog/favorite-editor.webp)

Each editor serves its own purpose—some users are used to Markdown edition, while others prefer a non-technical, visual approach.

At the end, **Markdown syntax is the final output** for both editors.

This article explains the technical processes behind the visual editor, exploring how it interprets Markdown, converts it back, and why this process might occasionally lead to changes from the original content.

## **Markdown Editor**

![Edit directly markdown on Nuxt Studio](/blog/markdown-editor.webp)

The Markdown editor in Nuxt Studio provides full control over your content, allowing you to write directly in [MDC](/docs/files/markdown) (an empowered Markdown syntax). This syntax enables integration of Vue components directly into your Markdown files, offering more flexibility to structure your pages.

When your file is saved with the Markdown editor, the content is stored exactly as you've written it, preserving all specific syntax and formatting. This editor is ideal for users comfortable with Markdown who want precise control over the layout and structure of their content.

## **Visual Editor**

![Edit your content with a visual editor on Nuxt Studio](/blog/visual-editor.webp)

The Visual Editor is a sort of WYSIWYG (What You See Is What You Get) tool built on top of [TipTap](https://tiptap.dev/) and [ProseMirror](https://prosemirror.net/), designed to abstract away the complexities of Markdown syntax and offer a more intuitive, visual editing experience. This editor is particularly user-friendly for those who prefer not to deal with raw Markdown code.

### **How the visual editor processes files**

When you open a Markdown file with the Visual Editor, Nuxt Studio first parses the original Markdown file. Using the [MDC module](https://github.com/nuxt-modules/mdc), it generates an Abstract Syntax Tree (AST). This AST is then converted into a TipTap-compatible format (TipTap AST), allowing the editor to accurately render the document visually.

Once the Visual Editor displays the content, users can make updates in a visually intuitive way. Behind the scenes, the editor continuously transforms the TipTap AST back into MDC AST then MDC syntax, ensuring that your content remains in Markdown format.

### **Why Changes might occur in the original markdown file without user modification**

![Alert is displayed when automatic markdown parsing is detected](/blog/automatic-parsing-modal.webp)

#### **Non-Critical Changes**

As the Visual Editor translates the visual formatting back into Markdown, it applies a parsing algorithm that applies predefined Markdown standards. In some cases, these standards may differ slightly from the original content. These changes are typically non-impactful and are only another working syntax of the Markdown, the rendered website should remain consistent with the original.

#### **Critical Changes**

Ideally, every feature in Markdown has a direct and accurate equivalent in the Visual Editor. We've built custom TipTap extensions to support custom MDC syntax such as [Vue components](/docs/files/markdown#vue-components) edition or [front-matter](/docs/files/markdown#front-matter). However, in rare cases, particularly with complex or unconventional Markdown elements, the Visual Editor may not fully support or correctly interpret these elements. When this happens, the editor might approximate, simplify, or even omit these elements during the parsing process.

Such discrepancies can result in data loss or regressions when converting back to Markdown. While these occurrences are rare, they can disrupt the intended display or functionality of your content.

Our primary objective is to prevent any loss of content and to maintain the integrity of your Markdown files. If you encounter any issues where the transition from visual to Markdown isn’t perfect, we encourage you to report them on our Discord server. Your feedback is invaluable in helping us refine and improve the Visual Editor, ensuring it meets the needs of all users.

## **Best practices to minimize unintended changes**

To avoid losing crucial formatting or content, consider the following best practices:

- **Avoid using complex HTML structures**. As the MDC syntax allows you to integrate Vue components, It's more effective to create reusable components that can be easily inserted into the Markdown and edited within the editor, rather than relying on intricate HTML code.
- **Use one editor consistently.** Whenever possible, select the editor that best suits your needs and stick with it for the entire page.
- **Review changes after switching from an editor to the other.** After switching editors, always review the Markdown (on the review page) and check the preview to ensure no important elements have been altered.

## **Conclusion**

Switching between the Markdown editor and the visual editor in Nuxt Studio offers flexibility, but it's important to be aware of the technical implications.

Understanding how the visual editor processes and converts Markdown can help ensure that what you craft in Markdown is accurately displayed in the visual editor, allowing non-technical users to easily edit everything without altering the original Markdown file.

###
