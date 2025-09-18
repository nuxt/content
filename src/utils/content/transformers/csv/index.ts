// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: fix types
import { unified } from 'unified'
import { defineTransformer } from '../utils'
import { fromCSV } from './from-csv'

function csvParse(options) {
  const parser = (doc) => {
    return fromCSV(doc, options)
  }

  Object.assign(this, { Parser: parser })

  const toJsonObject = (tree) => {
    const [header, ...rows] = tree.children
    const columns = header.children.map(col => col.children[0].value)

    const data = rows.map((row) => {
      return row.children.reduce((acc, col, i) => {
        acc[String(columns[i])] = col.children[0]?.value
        return acc
      }, {})
    })
    return data
  }

  const toJsonArray = (tree) => {
    const data = tree.children.map((row) => {
      return row.children.map(col => col.children[0]?.value)
    })
    return data
  }

  const compiler = (doc) => {
    if (options.json) {
      return toJsonObject(doc)
    }
    return toJsonArray(doc)
  }

  Object.assign(this, { Compiler: compiler })
}

export default defineTransformer({
  name: 'csv',
  extensions: ['.csv'],
  parse: async (file, options = {}) => {
    const stream = unified().use(csvParse, {
      delimiter: ',',
      json: true,
      ...options,
    })
    const { result } = await stream.process(file.body)

    // If the file id includes a row index, parse the file as a single object
    if (file.id.includes('#')) {
      return { id: file.id, ...result[0] }
    }

    // Otherwise, parse the file as an array
    return {
      id: file.id,
      body: result,
    }
  },
})
