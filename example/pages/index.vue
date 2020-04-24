<template>
  <div>
    <h1>Home</h1>
    <h2>Markdown</h2>
    <pre>{{ markdown }}</pre>
    <h3>Content</h3>
    <nuxt-content :document="markdown" />
    <hr />
    <h2>JSON</h2>
    <pre>{{ json }}</pre>
    <h2>JSON5</h2>
    <pre>{{ json5 }}</pre>
    <h2>CSV</h2>
    <pre>{{ csv }}</pre>
    <h2>YAML</h2>
    <pre>{{ yaml }}</pre>
  </div>
</template>

<script>

export default {
  async asyncData ({ $content }) {
    const markdown = await $content('markdown').fetch()
    const json = await $content('json').fetch()
    const json5 = await $content('json5').fetch()
    const csv = await $content('csv').fetch()
    const yaml = await $content('yaml').fetch()

    return {
      markdown,
      json,
      json5,
      csv,
      yaml
    }
  }
}
</script>
