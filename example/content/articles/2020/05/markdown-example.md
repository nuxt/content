---
title: Markdown example
slug: markdown-example
date: 2020/05/24 16:40:48
tags:
  - markdown
description: markdown example
authors:
  - name: Eleven Zhang
    avatarUrl: https://avatars3.githubusercontent.com/u/9312677?s=60&v=4
    link: https://github.com/eteplus
---

## h2 Heading :yum: :broken_heart:
### h3 Heading :purple_heart:
#### h4 Heading :dog:
##### h5 Heading :dog2:
###### h6 Heading :smile: :cry: :kiss:

## Horizontal Rules

___

---

***

## Typographic replacements

Enable typographer option to see result.

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,  -- ---

"Smartypants, double quotes" and 'single quotes'

## Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~

## Blockquotes

> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.

## Lists

Unordered

+ Create a list by starting a line with `+`, `-`, or `*`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa

1. You can use sequential numbers...
1. ...or keep all the numbers as `1.`

Start numbering with offset:

57. foo
1. bar

## todo list
- [ ] Lorem ipsum dolor sit amet
- [x] Consectetur adipiscing elit

### [Footnotes](https://github.com/eteplus/menote)

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference[^second].

## Code

Inline `code`

Indented code

  // Some comments
  line 1 of code
  line 2 of code
  line 3 of code

Block code "fences"

```xml
Sample text here...
```

Syntax highlighting

```javascript
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
```

```python
def fn():
    print('abc')
```

## Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

## Links

[link text](https://github.com/eteplus/menote)

[link with title](https://github.com/eteplus/menote "markdown-editor")

## Images

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://octodex.github.com/images/dojocat.jpg  "The Dojocat"

### [Emojies](https://github.com/eteplus/menote)

> Classic markup: :wink: :crush: :cry: :tear: :laughing: :yum:
>
> Shortcuts (emoticons): :-) :-( 8-) ;)

### [Subscript](https://github.com/eteplus/menote) / [Superscript](https://github.com/eteplus/menote)

- 19^th^
- H~2~O
