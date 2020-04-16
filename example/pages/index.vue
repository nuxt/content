<template>
  <div>
    <h1>Home</h1>
    <h2>Markdown</h2>
    <nuxt-content :body="markdown.body" />
    <hr />
    <h2>JSON</h2>
    <pre>
      <code>
        {{ json }}
      </code>
    </pre>
    <h2>CSV</h2>
    <pre>
      <code>
        {{ csv }}
      </code>
    </pre>
  </div>
</template>

<script>

export default {
  async asyncData ({ $content }) {
    const markdown = await $content('markdown').fetch()
    const json = await $content('json').fetch()
    const csv = await $content('csv').fetch()

    return {
      markdown,
      json,
      csv
    }
  }
}
</script>
