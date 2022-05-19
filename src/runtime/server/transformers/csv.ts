import { useRuntimeConfig } from '#imports'

export default {
  name: 'csv',
  extentions: ['.csv'],
  parse: async (_id, content) => {
    const config = { ...useRuntimeConfig().content?.csv || {} }

    const csvToJson: any = await import('csvtojson').then(m => m.default || m)

    const parsed = await csvToJson({ output: 'json', ...config })
      .fromString(content)

    return {
      _id,
      _type: 'csv',
      body: parsed
    }
  }
}
