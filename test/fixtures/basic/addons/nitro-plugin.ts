export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('content:file:beforeParse', (file) => {
    if (file._id.endsWith('.md')) {
      if (file.content.startsWith('---')) {
        const lines = file.content.split('\n')
        lines.splice(1, 0, '__beforeParse: true')
        file.content = lines.join('\n')
      } else {
        file.content = '---\n__beforeParse: true\n---\n' + file.content
      }
    }
  })

  nitroApp.hooks.hook('content:file:afterParse', (file) => {
    file.__afterParse = true
  })
})
