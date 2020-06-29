---
title: Writing content
description: 'Learn how to write your content/, supporting Markdown, YAML, CSV and JSON.'
position: 3
category: Getting started
multiselectOptions:
  - VuePress
  - Gridsome
  - Nuxt
---

First of all, create a `content/` directory in your project:

```bash
content/
  articles/
    article-1.md
    article-2.md
  home.md
```

This module will parse `.md`, `.yaml`, `.yml`, `.csv`, `.json`, `.json5`, `.xml` files and generate the following properties:

- `dir`
- `path`
- `slug`
- `extension` (ex: `.md`)
- `createdAt`
- `updatedAt`

## Markdown

This module converts your `.md` files into a JSON AST tree structure, stored in a `body` variable.

Make sure to use the `<nuxt-content>` component to display the `body` of your markdown content, see [displaying content](/displaying).

> You can check the [basic syntax guide](https://www.markdownguide.org/basic-syntax) to help you master Markdown

### Front Matter

You can add a YAML front matter block to your markdown files. The front matter must be the first thing in the file and must take the form of valid YAML set between triple-dashed lines. Here is a basic example:

```md
---
title: Introduction
description: Learn how to use @nuxt/content.
---
```

These variables will be injected into the document:

```json
{
  body: Object
  title: "Introduction"
  description: "Learn how to use @nuxt/content."
  dir: "/"
  extension: ".md"
  path: "/index"
  slug: "index"
  toc: Array
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Headings

This module automatically adds an `id` and a `link` to each heading.

Say we have the following markdown file:

```md[home.md]
# Lorem ipsum
## dolor—sit—amet
### consectetur &amp; adipisicing
#### elit
##### elit
```

It will be transformed to it's JSON AST structure, and by using the `nuxt-content` component, it will render HTML like:

```html
<h1 id="lorem-ipsum-"><a href="#lorem-ipsum-" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>Lorem ipsum</h1>
<h2 id="dolorsitamet"><a href="#dolorsitamet" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>dolor—sit—amet</h2>
<h3 id="consectetur--adipisicing"><a href="#consectetur--adipisicing" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>consectetur &#x26; adipisicing</h3>
<h4 id="elit"><a href="#elit" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>elit</h4>
<h5 id="elit-1"><a href="#elit-1" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>elit</h5>
```

> The links in headings are empty and therefore hidden, so it's up to you to style them. For an example, try hovering one of the headers in these docs.

### Links

Links are transformed to add valid `target` and `rel` attributes using [remark-external-links](https://github.com/remarkjs/remark-external-links). You can check [here](/configuration#markdown) to learn how to configure this plugin.

Relative links are also automatically transformed to [nuxt-link](https://nuxtjs.org/api/components-nuxt-link/) to provide navigation between page components with enhanced performance through smart prefetching.

Here is an example using external, relative, markdown and html links:

```md
---
title: Home
---

## Links

<nuxt-link to="/articles">Nuxt Link to Blog</nuxt-link>

<a href="/articles">Html Link to Blog</a>

[Markdown Link to Blog](/articles)

<a href="https://nuxtjs.org">External link html</a>

[External Link markdown](https://nuxtjs.org)
```

### Footnotes

This module supports extended markdown syntax for footnotes using [remark-footnotes](https://github.com/remarkjs/remark-footnotes). You can check [here](/configuration#markdown) to learn how to configure this plugin.

Here is an example using footnotes:

```md
Here's a simple footnote,[^1] and here's a longer one.[^bignote]

[^1]: This is the first footnote.

[^bignote]: Here's one with multiple paragraphs and code.

    Indent paragraphs to include them in the footnote.

    `{ my code }`

    Add as many paragraphs as you like.
```

> You can check the [extended syntax guide](https://www.markdownguide.org/extended-syntax/#footnotes) for more information about footnotes.

### Codeblocks

This module automatically wraps codeblocks and applies [PrismJS](https://prismjs.com) classes (see [syntax highlighting](/writing#syntax-highlighting)).

Codeblocks in Markdown are wrapped inside 3 backticks. Optionally, you can define the language of the codeblock to enable specific syntax highlighting.

Orginally markdown does not support filenames or highlighting specific lines inside codeblocks. However, this module allows it with it's own custom syntax:

- Highlighted line numbers inside curly braces
- Filename inside square brackets

<pre class="language-js">
```js{1,3-5}[server.js]
const http = require('http')
const bodyParser = require('body-parser')

http.createServer((req, res) => {
  bodyParser.parse(req, (error, body) => {
    res.end(body)
  })
}).listen(3000)
```
</pre>

After rendering with the `nuxt-content` component, it will look like this:

```html
<div class="nuxt-content-highlight">
  <span class="filename">server.js</span>
  <pre class="language-js" data-line="1,3-5">
    <code>
      ...
    </code>
  </pre>
</div>
```

> Line numbers are added to the `pre` tag in `data-line` attribute.

> The filename will be converted to a span with a `filename` class, it's up to you to style it. Take a look at this documentation, on the top right on code blocks.

### Syntax highlighting

It supports by default code highlighting using [PrismJS](https://prismjs.com) and injects the theme defined in options into your Nuxt.js app, see [configuration](/configuration#markdownprismtheme).

### HTML

You can write HTML in your Markdown:

```md[home.md]
---
title: Home
---

## HTML

<p><span class="note">A mix of <em>Markdown</em> and <em>HTML</em>.</span></p>
```

Beware that when placing Markdown inside a component, it must be preceded and followed by an empty line, otherwise the whole block is treated as custom HTML.

**This won't work:**

```html
<div class="note">
  *Markdown* and <em>HTML</em>.
</div>
```

**But this will:**

```html
<div class="note">

  *Markdown* and <em>HTML</em>.

</div>
```

**As will this**:

```html
<span class="note">*Markdown* and <em>HTML</em>.</span>
```

### Vue components

You can use global Vue components or locally registered in the page you're displaying your markdown.

Since `@nuxt/content` operates under the assumption all Markdown is provided by the author (and not via third-party user submission), sources are processed in full (tags included), with a couple of caveats from [rehype-raw](https://github.com/rehypejs/rehype-raw):

1. You need to refer to your components by kebab case naming:

```html
Use <my-component> instead of <MyComponent>
```

2. You cannot use self-closing tags, i.e., **this won't work**:

```html
<my-component/>
```

But **this will**:

```html
<my-component></my-component>
```

**Example:**

Say we have a Vue component called [ExampleMultiselect.vue](https://github.com/nuxt/content/blob/master/docs/components/examples/ExampleMultiselect.vue):

```md[home.md]
Please choose a *framework*:

<example-multiselect :options="['Vue', 'React', 'Angular', 'Svelte']"></example-multiselect>
```

**Result:**

<div class="border rounded p-2 mb-2 bg-gray-200 dark:bg-gray-800">

Please choose a *framework*:

<example-multiselect :options="['Vue', 'React', 'Angular', 'Svelte']"></example-multiselect>

</div>

You can also define the options for components in your front matter:

```md[home.md]
---
multiselectOptions:
  - VuePress
  - Gridsome
  - Nuxt
---

<example-multiselect :options="multiselectOptions"></example-multiselect>
```

<example-multiselect :options="multiselectOptions"></example-multiselect><br>

<base-alert type="info">

These components will be rendered using the `<nuxt-content>` component, see [displaying content](/displaying#component).

</base-alert>

#### Templates

You can use `template` tags for content distribution inside your Vue.js components:

```html
<my-component>
  <template #named-slot>
    <p>Named slot content.</p>
  </template>
</my-component>
```

However, you cannot render
[dynamic content](https://vuejs.org/v2/guide/syntax.html) nor use
[slot props](https://vuejs.org/v2/guide/components-slots.html#Scoped-Slots). I.e.,
**this wont work**:

```html
<my-component>
  <template #named-slot="slotProps">
    <p>{{ slotProps.someProperty }}</p>
  </template>
</my-component>
```

#### Global components

Since **v1.4.0** and Nuxt **v2.13.0**, you can now put your components in `components/global/` directory so you don't have to import them in your pages.

```bash
components/
  global/
    Hello.vue
content/
  home.md
```

Then in `content/home.md`, you can use `<hello></hello>` component without having to worry about importing it in your page.

### Table of contents

A `toc` array property will be injected into your document, listing all the `h2` and `h3` with their titles and ids, so you can link to them.

> Take a look at the right side of this page for an example.

### Example

A file `content/home.md`:

```md
---
title: Home
---

## Welcome!
```

Will be transformed into:

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "extension": ".md",
  "title": "Home",
  "toc": [
    {
      "id": "welcome",
      "depth": 2,
      "text": "Welcome!"
    }
  ],
  "body": {
    "type": "root",
    "children": [
      {
        "type": "element",
        "tag": "h2",
        "props": {
          "id": "welcome"
        },
        "children": [
          {
            "type": "element",
            "tag": "a",
            "props": {
              "ariaHidden": "true",
              "href": "#welcome",
              "tabIndex": -1
            },
            "children": [
              {
                "type": "element",
                "tag": "span",
                "props": {
                  "className": [
                    "icon",
                    "icon-link"
                  ]
                },
                "children": []
              }
            ]
          },
          {
            "type": "text",
            "value": "Welcome!"
          }
        ]
      }
    ]
  }
}
```

We internally add a `text` key with the markdown body that will be used for [searching](/fetching#searchfield-value) or [extending](/advanced#contentfilebeforeinsert) it.

You can see how to display your markdown in your application in the [displaying content](/displaying) section.

## CSV

Rows will be assigned to body variable.

### Example

A file `content/home.csv`:

```csv
title, description
Home, Welcome!
```

Will be transformed into:

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "extension": ".json",
  "body": [
    {
      "title": "Home",
      "description": "Welcome!"
    }
  ]
}
```

## XML

XML will be parsed

### Example

A file `content/home.xml`:

```xml
<xml>
  <item prop="abc">
    <title>Title</title>
    <description>Hello World</description>
  </item>
</xml>
```

Will be transformed into:

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "extension": ".xml",
  "body": {
    "xml": {
      "item": [
        {
          "$": {
            "prop": "abc"
          },
          "title": [
            "Title"
          ],
          "description": [
            "Hello World"
          ]
      }
    ]
  }
}
```


## YAML / YML

Data defined will be injected into the document.

> No body will be generated.

### Example

A file `content/home.yaml`:

```yaml
title: Home
description: Welcome!
```

Will be transformed into:

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "extension": ".yaml",
  "title": "Home",
  "description": "Welcome!"
}
```

## JSON / JSON5

Data defined will be injected into the document.

> No body will be generated.

### Example

A file `content/home.json`:

```json
{
  "title": "Home",
  "description": "Welcome!"
}

```

Will be transformed into:

```json
{
  "dir": "/",
  "slug": "home",
  "path": "/home",
  "extension": ".json",
  "title": "Home",
  "description": "Welcome!"
}
```
