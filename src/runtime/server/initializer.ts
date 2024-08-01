import { contentSchema, infoSchema, generateInsert, zodToSQL } from '../sqlite'
import useDatabaseAdaptor from './adaptors'
import { useRuntimeConfig } from '#imports'
import parsedContents from '#content-v3/dump.mjs'

export default async () => {
  const config = useRuntimeConfig().contentv3

  const db = useDatabaseAdaptor()

  await db.exec(zodToSQL(contentSchema, 'content'))
  await db.exec(zodToSQL(infoSchema, 'info'))

  const insert = generateInsert(infoSchema, 'info', { version: config.integrityVersion })
  await db.exec(mergeInterValues(insert.prepareSql, insert.values))

  await Promise.all(parsedContents.map(sql => db.exec(sql)))
}

function mergeInterValues(sql: string, values: any[]) {
  let index = 0
  return sql.replace(/\?/g, () => {
    const value = values[index++]
    switch (typeof value) {
      case 'string':
        return `'${value.replace(/'/g, '\'\'')}'`
      case 'number':
        return `${value}`
      case 'boolean':
        return value ? '1' : '0'
      default:
        return `'${JSON.stringify(value)}'`
    }
  })
}
