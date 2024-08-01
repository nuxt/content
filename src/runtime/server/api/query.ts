import { eventHandler, getQuery } from 'h3'
import useContentDatabase from '../adaptors'

export default eventHandler(async (event) => {
  let sqlQuery = String(getQuery(event).q || '')
  sqlQuery = (sqlQuery.includes('%20') ? decodeURIComponent(sqlQuery) : sqlQuery)

  if (!sqlQuery || !sqlQuery.toUpperCase().startsWith('SELECT')) {
    throw new Error('Invalid query')
  }

  const db = useContentDatabase()

  return db.all(sqlQuery)
})
