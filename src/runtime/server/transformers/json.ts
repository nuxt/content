import destr from 'destr'

export default {
  name: 'Json',
  extentions: ['.json', '.json5'],
  parse: async (id, content) => {
    let parsed = content

    if (typeof content === 'string') {
      if (id.endsWith('json5')) {
        parsed = (await import('json5').then(m => m.default || m))
          .parse(content)
      } else if (id.endsWith('json')) {
        parsed = destr(content)
      }
    }

    return {
      id,
      type: 'json',
      body: parsed
    }
  }
}
