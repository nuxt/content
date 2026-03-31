const SQL_COMMANDS = /SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|\$/i
const SQL_COUNT_REGEX = /COUNT\((DISTINCT )?("[a-z_]\w+"|[a-z_]\w+|\*)\)/i
const SQL_SELECT_REGEX = /^SELECT (.*?) FROM (\w+)( WHERE .*?)?( ORDER BY (["\w,\s]+) (ASC|DESC))?( LIMIT \d+)?( OFFSET \d+)?$/

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
  if (!sql) {
    throw new Error('Invalid query: Query cannot be empty')
  }

  // Reject newlines to prevent multi-statement injection
  if (sql.includes('\n') || sql.includes('\r')) {
    throw new Error('Invalid query: Newlines are not allowed in queries')
  }

  const cleanedupQuery = cleanupQuery(sql)

  // Query is invalid if the cleaned up query is not the same as the original query (it contains comments)
  if (cleanedupQuery !== sql) {
    throw new Error('Invalid query: SQL comments are not allowed')
  }

  const match = sql.match(SQL_SELECT_REGEX)
  if (!match) {
    throw new Error('Invalid query: Query must be a valid SELECT statement with proper syntax')
  }

  const [_, select, from, where, _orderByFull, orderBy, order, limit, offset] = match

  // COLUMNS
  const columns = select?.trim().split(', ') || []
  if (columns.length === 1) {
    if (
      columns[0] !== '*'
      && !columns[0]?.match(SQL_COUNT_REGEX)
      && !columns[0]?.match(/^"[a-z_]\w+"$/i)
    ) {
      throw new Error(`Invalid query: Column '${columns[0]}' has invalid format. Expected *, COUNT(), or a quoted column name`)
    }
  }
  else if (!columns.every(column => column.match(/^"[a-z_]\w+"$/i))) {
    throw new Error('Invalid query: Multiple columns must be properly quoted and alphanumeric')
  }

  // FROM
  if (from !== `_content_${collection}`) {
    const invalidCollection = String(from || '').replace(/^_content_/, '')
    throw new Error(`Invalid query: Collection '${invalidCollection}' does not exist`)
  }

  // WHERE
  if (where) {
    if (!where.startsWith(' WHERE (') || !where.endsWith(')')) {
      throw new Error('Invalid query: WHERE clause must be properly enclosed in parentheses')
    }
    const noString = cleanupQuery(where, { removeString: true })
    if (noString.match(SQL_COMMANDS)) {
      throw new Error('Invalid query: WHERE clause contains unsafe SQL commands')
    }
  }

  // ORDER BY (optional — COUNT queries omit it)
  if (orderBy && order) {
    const _order = (orderBy + ' ' + order).split(', ')
    if (!_order.every(column => column.match(/^("[a-zA-Z_]+"|[a-zA-Z_]+) (ASC|DESC)$/))) {
      throw new Error('Invalid query: ORDER BY clause must contain valid column names followed by ASC or DESC')
    }
  }

  // LIMIT
  if (limit !== undefined && !limit.match(/^ LIMIT \d+$/)) {
    throw new Error('Invalid query: LIMIT clause must be a positive number')
  }

  // OFFSET
  if (offset !== undefined && !offset.match(/^ OFFSET \d+$/)) {
    throw new Error('Invalid query: OFFSET clause must be a positive number')
  }

  return true
}

function cleanupQuery(query: string, options: { removeString: boolean } = { removeString: false }) {
  // Track whether we're inside a string literal
  let inString = false
  let stringFence = ''
  let result = ''
  for (let i = 0; i < query.length; i++) {
    const char = query[i]
    const nextChar = query[i + 1]

    if (inString) {
      if (char === stringFence) {
        if (nextChar === stringFence) {
          // Doubled quote escape (e.g., '' inside a string) — skip both, stay in string
          if (!options?.removeString) {
            result += char + char // preserve both quotes
          }
          i++
          continue
        }
        else {
          // String closing quote
          inString = false
          stringFence = ''
        }
      }
      // Inside string: keep character when not removing strings
      if (!options?.removeString) {
        result += char
      }
      continue
    }

    // Not in string — opening quote starts string tracking regardless of removeString mode
    if (char === '\'' || char === '"') {
      inString = true
      stringFence = char
      if (!options?.removeString) {
        result += char
      }
      continue
    }

    if (char === '-' && nextChar === '-') {
      // everything after this is a comment
      return result
    }

    if (char === '/' && nextChar === '*') {
      i += 2
      while (i < query.length && !(query[i] === '*' && query[i + 1] === '/')) {
        i += 1
      }
      if (i < query.length) i += 2
      continue
    }

    result += char
  }
  return result
}
