import marked from 'marked'

export default function ({ app }, inject) {
  const renderer = new marked.Renderer()

  renderer.link = function (href, title, text) {
    return '<a target="_blank" href="' + href + '" title="' + title + '">' + text + '</a>'
  }

  const compile = (markdown) => {
    if (!markdown) {
      return
    }

    return marked(markdown, { renderer })
  }

  inject('markdown', compile)
}
