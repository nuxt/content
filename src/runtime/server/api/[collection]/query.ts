import { eventHandler, getQuery, getRouterParam } from 'h3'
import useContentDatabase from '../../adaptors'

export default eventHandler(async (event) => {
  const collectionName = getRouterParam(event, 'collection')
  let sqlQuery = String(getQuery(event).q || '')
  sqlQuery = (sqlQuery.includes('%20') ? decodeURIComponent(sqlQuery) : sqlQuery)

  if (!sqlQuery || !sqlQuery.toUpperCase().startsWith('SELECT')) {
    throw new Error('Invalid query')
  }

  const tablename = sqlQuery.match(/FROM\s+(\w+)/)?.[1]
  if (tablename !== collectionName) {
    throw new Error('Invalid query')
  }

  return useContentDatabase().all(sqlQuery)
})
