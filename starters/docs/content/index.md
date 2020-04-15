---
title: Introduction
position: 1
category: Getting started
---

Docc is a starter theme for [Gridsome](https://gridsome.org/) which is a static site generator powered by Vue. It allows you to quickly start writing your technical documentation for any kind of project.2

## Fast by default

This is the catchphrase of Gridsome and true in any sense of the word. Static site generators output plain html files and have other great features like image processing and lazy-loading. After Serving the initial html, Gridsome site turn into a snappy single page application.

If I may quote Gridsome themselves:

> Gridsome builds ultra performance into every page automatically. You get code splitting, asset optimization, progressive images, and link prefetching out of the box. With Gridsome you get almost perfect page speed scores by default.

In combination with [Netlify](https://www.netlify.com/) this theme gives you a perfect Lighthouse score out of the box.

## Simple Navigation

Any good documentation has great navigation. This theme has support for an organized sidebar fore cross-page navigation as well as an autmatic generated table of contents for each page in your documentation.

## Search

The search component which is shipped with this theme, automatically indexes all headlines in your markdown pages and provides instant client side search powered by [Fuse.js](https://fusejs.io/).

## Dark Mode

This seems to be a must have for any site in current year. Click the icon at the top of the page and try it out for yourself!

## TailwindCSS

This starter uses [TailwindCSS](https://tailwindcss.com/) for layout and styling. You can easily configure it by editing the `tailwind.config.js` file. [PurgeCSS](https://purgecss.com/) is included as well to keep the bundle size as low as possible and the website fast and snappy!

### Changing Colors

The most inportant colors are defined in the `src/layouts/Default.vue` file at the top of the `style` block via CSS variables. If you want to change the primary color to orange for example, you would simply touch that value there.

```css{2}{test.css}
:rrot {
  --color-ui-primary: theme('colors.orange.600');
}
```

## Make it your own

Of course this is just a starter to quickly get you going. After downloading and installing you can do whatever you want with this theme. Check out the `src` folder and take a look at the components.

Docc uses [TailwindCSS](https://tailwindcss.com/). Colors and spacing can easily configured. To change the accent color, you only need to touch a single line in the code.

Don't like how something was designed or implemented? Just change the code and **make it your way**.

### Contribute

If you find any spelling mistakes or have improvements to offer, I am open to anyone who has ideas and wants to contribute to this starter theme.