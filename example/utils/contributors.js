const fetch = require('node-fetch')

module.exports = function () {
  return async (tree, file) => {
    let filePath
    tree.children = tree.children.map((node) => {
      const TAG_REGEX = /\s*<(authors)\s*/i
      if (node.type === 'html' && node.value.match(TAG_REGEX)) {
        filePath = 'README.md' // detect file path
        node.value = node.value.replace(TAG_REGEX, '<$1 :items="$authors" ')
      }
      return node
    })
    if (filePath) {
      const commits = await fetch(
        'https://api.github.com/repos/nuxt/content/commits?path=' + filePath
      ).then(res => res.json())
      const authors = commits
        .map(commit => commit.author.login)
        .filter(Boolean)

      file.data.$authors = [...new Set(authors)]
    }
    return tree
  }
}
