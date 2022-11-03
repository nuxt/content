<template>
  <ContentRenderer :value="emptyDocument">
    <template #empty>
      Empty!!!
    </template>
  </ContentRenderer>
</template>

<script>
const emptyDocument = {
  _path: '/_markdown',
  _dir: '',
  _draft: false,
  _partial: true,
  _locale: 'en',
  _empty: true,
  title: 'Markdown',
  description: '',
  body: {
    type: 'root',
    children: [],
    toc: {
      title: '',
      searchDepth: 2,
      depth: 2,
      links: []
    }
  },
  _type: 'markdown',
  _id: 'content:_markdown.md',
  _source: 'content',
  _file: '_markdown.md',
  _extension: 'md'
}
</script>
