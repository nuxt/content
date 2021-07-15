// https://github.com/remarkjs/remark-directive/blob/main/index.js
import syntax from './micromark-directive'
import fromMarkdown from './remark-directive/from-markdown'
import toMarkdown from './remark-directive/to-markdown'

export default function directive() {
  const data = this.data()

  add('micromarkExtensions', syntax())
  add('fromMarkdownExtensions', fromMarkdown)
  add('toMarkdownExtensions', toMarkdown)

  function add(field, value) {
    /* istanbul ignore if - other extensions. */
    if (!data[field]) {
      data[field] = []
    }

    data[field].push(value)
  }
}
