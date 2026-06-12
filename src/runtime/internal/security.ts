const SQL_COMMANDS = /SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|\$/i
// Resource-heavy or filesystem/code functions that the query builder never emits.
// Reaching the database through the public query endpoint, these enable a CPU or
// memory denial of service (for example `randomblob(1e9)`) or worse, so they are
// rejected in the WHERE clause where the only function-call surface exists.
const SQL_UNSAFE_FUNCTIONS = /\b(randomblob|zeroblob|load_extension|readfile|writefile|fts3_tokenizer|pg_sleep|pg_read_file|pg_read_binary_file|dblink|lo_import|lo_export)\s*\(/i
// Upper bound on the accepted query length. The builder never produces anything
// near this, and the cap prevents a multi-kilobyte payload from driving the lazy
// quantifiers in `SQL_SELECT_REGEX` into pathological backtracking.
const MAX_QUERY_LENGTH = 50_000
// Combines the upstream security tightening (anchored regex, required `as count`
// alias) with the feature additions (quoted column names, optional `ORDER BY` for
// count queries). Column identifiers allow a single character (`\w*`) since a
// schema field can legitimately be one character long.
const SQL_COUNT_REGEX = /^COUNT\((DISTINCT )?("[a-z_]\w*"|[a-z_]\w*|\*)\) as count$/i
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

  if (sql.length > MAX_QUERY_LENGTH) {
    throw new Error('Invalid query: Query exceeds the maximum allowed length')
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
      && !columns[0]?.match(/^"[a-z_]\w*"$/i)
    ) {
      throw new Error(`Invalid query: Column '${columns[0]}' has invalid format. Expected *, COUNT(), or a quoted column name`)
    }
  }
  else if (!columns.every(column => column.match(/^"[a-z_]\w*"$/i))) {
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
    if (noString.match(SQL_UNSAFE_FUNCTIONS)) {
      throw new Error('Invalid query: WHERE clause contains unsafe SQL functions')
    }
  }

  // ORDER BY is optional, since COUNT queries omit it.
  if (orderBy && order) {
    const _order = (orderBy + ' ' + order).split(', ')
    // Column names must start with a letter or underscore but may contain digits
    // afterwards (for example `h1`, `field_2024`, `version2`). An earlier upstream
    // regex forbade digits entirely, which rejected legitimate user schema fields.
    if (!_order.every(column => column.match(/^("[a-zA-Z_]\w*"|[a-zA-Z_]\w*) (ASC|DESC)$/))) {
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
  // Track whether the scanner is currently inside a string literal.
  let inString = false
  let stringFence = ''
  let result = ''
  for (let i = 0; i < query.length; i++) {
    const char = query[i]
    const nextChar = query[i + 1]

    if (inString) {
      if (char === stringFence) {
        if (nextChar === stringFence) {
          // Doubled-quote escape (for example `''` inside a string). Skip both
          // characters and stay inside the string.
          if (!options?.removeString) {
            // Preserve both quotes when not stripping the string content.
            result += char + char
          }
          i++
          continue
        }
        else {
          // Closing quote of the string literal.
          inString = false
          stringFence = ''
        }
      }
      // Inside a string, keep each character when not removing strings.
      if (!options?.removeString) {
        result += char
      }
      continue
    }

    // Outside a string, an opening quote starts string tracking regardless of
    // `removeString` mode.
    if (char === '\'' || char === '"') {
      inString = true
      stringFence = char
      if (!options?.removeString) {
        result += char
      }
      continue
    }

    if (char === '-' && nextChar === '-') {
      // Line comment, everything after this is a comment.
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
