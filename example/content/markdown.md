---
title: Markdown
description: This is a .md file
---

## HTML

<p><span class="note">A mix of <em>Markdown</em> and <em>HTML</em>.</span></p>

## Custom components

<movie-info name="Porco Rosso">
  <template #summary>

Porco Rosso (Japanese: 紅の豚, Hepburn: _Kurenai no Buta_, lit. _Crimson Pig_) is a
1992 Japanese animated comedy-adventure film written and directed by
[Hayao Miyazaki]. It is based on _Hikōtei Jidai_ ("The Age of the Flying Boat"), a
three-part 1989 watercolor manga by Miyazaki.

[Hayao Miyazaki]: https://en.wikipedia.org/wiki/Hayao_Miyazaki

  </template>
</movie-info>

## Links

<nuxt-link to="/articles">Nuxt Link to Blog</nuxt-link>

<a href="/articles">Html Link to Blog</a>

[Markdown Link to Blog](/articles)

<a href="https://nuxtjs.org">External link html</a>

[External Link markdown](https://nuxtjs.org)

## Codeblocks

```js{1,3-5}[server.js]
const http = require('http')
const bodyParser = require('body-parser')

http.createServer((req, res) => {
  bodyParser.parse(req, (error, body) => {
    res.end(body)
  })
}).listen(3000)
```

## Footnotes

Here is a footnote reference,[^1]
another,[^longnote],
and optionally there are inline
notes.^[you can type them inline, which may be easier, since you don’t
have to pick an identifier and move down to type the note.]

[^1]: Here is the footnote.

[^longnote]: Here’s one with multiple blocks.

    Subsequent paragraphs are indented to show that they
belong to the previous footnote.

        { some.code }

    The whole paragraph can be indented, or just the first
    line.  In this way, multi-paragraph footnotes work like
    multi-paragraph list items.

This paragraph won’t be part of the note, because it
isn’t indented.