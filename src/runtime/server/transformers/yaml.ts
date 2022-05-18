import { parseFrontMatter } from '../../markdown-parser'

export default {
  name: 'Yaml',
  extentions: ['.yml', '.yaml'],
  parse: async ($id, content) => {
    const { data } = await parseFrontMatter(`---\n${content}\n---`)

    // Keep array contents under `body` key
    let parsed = data
    if (Array.isArray(data)) {
      // eslint-disable-next-line no-console
      console.warn(`YAML array is not supported in ${$id}, moving the array into the \`body\` key`)
      parsed = { body: data }
    }

    return {
      ...parsed,
      $id,
      $type: 'yaml'
    }
  }
}
