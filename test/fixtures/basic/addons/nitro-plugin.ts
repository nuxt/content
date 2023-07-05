import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('content:file:beforeParse', (file) => {
    if (file._id.endsWith('.md')) {
      if (file.body.startsWith('---')) {
        const lines = file.body.split('\n')
        lines.splice(1, 0, '__beforeParse: true')
        file.body = lines.join('\n')
      } else {
        file.body = '---\n__beforeParse: true\n---\n' + file.body
      }
    }
  })

  nitroApp.hooks.hook('content:file:afterParse', (file) => {
    file.__afterParse = true
  })
})
