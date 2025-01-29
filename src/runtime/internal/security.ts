const SQL_COMMANDS = /SELECT|INSERT|UPDATE|DELETE|DROP|ALTER/i
const SQL_CLEANUN_REGEX = /(['"`])(?:\\.|[^\\])*?\1|\/\*[\s\S]*?\*\//g
const SQL_COUNT_REGEX = /COUNT\((DISTINCT )?[a-z_]\w+\)/i
const SQL_SELECT_REGEX = /^SELECT (.*) FROM (\w+)( WHERE .*)? ORDER BY (["\w,\s]+) (ASC|DESC)( LIMIT \d+)?( OFFSET \d+)?$/

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
  const match = sql.match(SQL_SELECT_REGEX)
  if (!match) {
    throw new Error('Invalid query')
  }

  const [_, select, from, where, orderBy, order, limit, offset] = match

  // COLUMNS
  const columns = select.trim().split(', ')
  if (columns.length === 1) {
    if (
      columns[0] !== '*'
      && !columns[0].match(SQL_COUNT_REGEX)
      && !columns[0].match(/^"[a-z_]\w+"$/)
    ) {
      throw new Error('Invalid query')
    }
  }
  else if (!columns.every(column => column.match(/^"[a-z_]\w+"$/i))) {
    throw new Error('Invalid query')
  }

  // FROM
  if (from !== `_content_${collection}`) {
    throw new Error('Invalid query')
  }

  // WHERE
  if (where) {
    if (!where.startsWith(' WHERE (') || !where.endsWith(')')) {
      throw new Error('Invalid query')
    }
    const noString = where?.replace(SQL_CLEANUN_REGEX, '')
    if (noString.match(SQL_COMMANDS)) {
      throw new Error('Invalid query')
    }
  }

  // ORDER BY
  const _order = (orderBy + ' ' + order).split(', ')
  if (!_order.every(column => column.match(/^("[a-z_]+"|[a-z_]+) (ASC|DESC)$/))) {
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
