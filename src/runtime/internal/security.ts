const SQL_COMMANDS = /SELECT|INSERT|UPDATE|DELETE|DROP|ALTER/i

/**
 * Assert that the query is safe
 * A query will consider safe if it matched the output pattern of query builder
 * Any mismatch will be considered as unsafe
 *
 * @param sql - The SQL query to check
 * @param collection - The collection to check
 * @returns True if the query is safe, false otherwise
 */
export function assertSafeQuery(sql: string, collection: string) {
  const match = sql.match(/^SELECT (.*) FROM (\w+)( WHERE .*)? ORDER BY (["\w,\s]+) (ASC|DESC)( LIMIT \d+)?( OFFSET \d+)?$/)
  if (!match) {
    throw new Error('Invalid query')
  }

  const [_, select, from, where, orderBy, order, limit, offset] = match

  // COLUMNS
  const columns = select.trim().split(', ')
  if (
    !columns.every(column =>
      column === '*'
      || column.match(/^"[a-z_]\w+"$/i)
      || column.match(/^COUNT\((DISTINCT )?[a-z_]\w+\) as count$/i),
    )
  ) {
    throw new Error('Invalid query')
  }

  // FROM
  if (from !== `_content_${collection}`) {
    throw new Error('Invalid query')
  }

  // WHERE
  if (where) {
    if (!where.match(/^ WHERE \(.*\)$/)) {
      throw new Error('Invalid query')
    }
    const noString = where?.replace(/"[^"]+"/g, '').replace(/'[^']+'/g, '')
    if (noString.match(SQL_COMMANDS)) {
      throw new Error('Invalid query')
    }
  }

  // ORDER BY
  if (!orderBy.split(', ').every(column => column.match(/^[a-z_]\w+$/i) || column.match(/^"[^"]+"$/))) {
    throw new Error('Invalid query')
  }
  if (order !== 'ASC' && order !== 'DESC') {
    throw new Error('Invalid query')
  }

  // LIMIT
  if (limit !== undefined && !limit.match(/^ LIMIT \d+$/)) {
    throw new Error('Invalid query')
  }

  // OFFSET
  if (offset !== undefined && !offset.match(/^ OFFSET \d+$/)) {
    throw new Error('Invalid query')
  }

  return true
}
