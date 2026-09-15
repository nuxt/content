const SQL_COMMANDS = /SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|\$/i
const SQL_COUNT_REGEX = /^COUNT\((DISTINCT )?([a-z_]\w+|\*)\) as count$/i
// Parentheses in WHERE are only valid after these keywords (grouping / IN lists).
// Anything else that looks like a call (name(, "name"(, [name](, `name`() is disallowed.
const SQL_WHERE_PAREN_KEYWORDS = /\b(?:WHERE|AND|OR|IN)\s*\(/gi
// Bare identifiers use a word boundary; quoted/bracketed forms match the whole identifier unit.
const SQL_FUNCTION_CALL = /(?:\b[A-Z_]\w*|["`[][A-Z_]\w*["`\]])\s*\(/i

/**
 * Hard ceiling on SQL statement length accepted from the client.
 * Legitimate query-builder output is far smaller; this bounds work done by
 * validation and by the database before any expensive matching.
 */
export const MAX_SQL_QUERY_LENGTH = 100_000

function isWordChar(code: number): boolean {
  // Same class as JS `\w`: [A-Za-z0-9_]
  return (code >= 48 && code <= 57)
    || (code >= 65 && code <= 90)
    || (code >= 97 && code <= 122)
    || code === 95
}

interface ParsedSelectQuery {
  select: string
  from: string
  where: string | undefined
  orderBy: string
  order: string
  limit: string | undefined
  offset: string | undefined
}

/**
 * Linear (O(n)) structural parse of the query-builder SELECT shape.
 *
 * Previously this used a single catastrophic backtracking regex
 * (`^SELECT (.*) FROM … ( WHERE .*)? ORDER BY …`) which an unauthenticated
 * client could stall for tens of seconds with a few dozen KiB of junk
 * (ReDoS). Walk the fixed suffixes / separators instead so rejection is
 * proportional to input length.
 *
 * Expected shape (produced by `collectionQueryBuilder`):
 *   SELECT <cols> FROM <table>[ WHERE <clause>] ORDER BY <cols> (ASC|DESC)[ LIMIT n][ OFFSET n]
 */
function parseSelectQuery(sql: string): ParsedSelectQuery | null {
  // No leading/trailing whitespace — matches the query builder's exact output.
  if (!sql.startsWith('SELECT ')) {
    return null
  }

  let rest = sql
  let offset: string | undefined
  let limit: string | undefined
  let order: string | undefined

  // Peel optional trailing OFFSET / LIMIT (literal suffixes, digits only).
  {
    const m = / OFFSET \d+$/.exec(rest)
    if (m) {
      offset = m[0]
      rest = rest.slice(0, -offset.length)
    }
  }
  {
    const m = / LIMIT \d+$/.exec(rest)
    if (m) {
      limit = m[0]
      rest = rest.slice(0, -limit.length)
    }
  }

  if (rest.endsWith(' ASC')) {
    order = 'ASC'
    rest = rest.slice(0, -4)
  }
  else if (rest.endsWith(' DESC')) {
    order = 'DESC'
    rest = rest.slice(0, -5)
  }
  else {
    return null
  }

  // Last " ORDER BY " separates the order-by column list from the rest.
  // Using lastIndexOf keeps this correct if a value literal ever contained
  // the substring (the subsequent per-clause checks still reject that).
  const orderByMarker = ' ORDER BY '
  const orderByIdx = rest.lastIndexOf(orderByMarker)
  if (orderByIdx === -1) {
    return null
  }
  const orderBy = rest.slice(orderByIdx + orderByMarker.length)
  if (!orderBy.length) {
    return null
  }
  rest = rest.slice(0, orderByIdx)

  // rest is now "SELECT <cols> FROM <table>[ WHERE <clause>]"
  const afterSelect = rest.slice('SELECT '.length)
  const fromMarker = ' FROM '
  const fromIdx = afterSelect.indexOf(fromMarker)
  if (fromIdx === -1) {
    return null
  }
  const select = afterSelect.slice(0, fromIdx)
  const afterFrom = afterSelect.slice(fromIdx + fromMarker.length)

  // Table name is a single word token (matches the old (\w+) group).
  let tableEnd = 0
  while (tableEnd < afterFrom.length && isWordChar(afterFrom.charCodeAt(tableEnd))) {
    tableEnd += 1
  }
  if (tableEnd === 0) {
    return null
  }
  const from = afterFrom.slice(0, tableEnd)
  const afterTable = afterFrom.slice(tableEnd)

  let where: string | undefined
  if (afterTable.length) {
    if (!afterTable.startsWith(' WHERE ')) {
      return null
    }
    where = afterTable
  }

  return { select, from, where, orderBy, order, limit, offset }
}

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

  // Bound work before any scanning (defense-in-depth against oversized bodies).
  if (sql.length > MAX_SQL_QUERY_LENGTH) {
    throw new Error('Invalid query: Query exceeds maximum allowed length')
  }

  const cleanedupQuery = cleanupQuery(sql)

  // Query is invalid if the cleaned up query is not the same as the original query (it contains comments)
  if (cleanedupQuery !== sql) {
    throw new Error('Invalid query: SQL comments are not allowed')
  }

  const parsed = parseSelectQuery(sql)
  if (!parsed) {
    throw new Error('Invalid query: Query must be a valid SELECT statement with proper syntax')
  }

  const { select, from, where, orderBy, order, limit, offset } = parsed

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
    const collection = String(from || '').replace(/^_content_/, '')
    throw new Error(`Invalid query: Collection '${collection}' does not exist`)
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
    // Block SQLite function calls (randomblob, zeroblob, hex, length, …),
    // including quoted/bracketed forms SQLite accepts as identifiers: "abs"(, [abs](, `abs`(.
    // Only single-quoted value literals are stripped so identifier quotes stay visible to the matcher.
    // The query builder never emits functions in WHERE; only grouping and IN (...).
    const noSingleQuoted = cleanupQuery(where, { removeSingleQuoted: true })
    const withoutGroupingParens = noSingleQuoted.replace(SQL_WHERE_PAREN_KEYWORDS, ' ')
    if (SQL_FUNCTION_CALL.test(withoutGroupingParens)) {
      throw new Error('Invalid query: WHERE clause contains unsafe SQL expressions')
    }
  }

  // ORDER BY
  const _order = (orderBy + ' ' + order).split(', ')
  if (!_order.every(column => column.match(/^("[a-zA-Z_]+"|[a-zA-Z_]+) (ASC|DESC)$/))) {
    throw new Error('Invalid query: ORDER BY clause must contain valid column names followed by ASC or DESC')
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

function cleanupQuery(query: string, options: { removeString?: boolean, removeSingleQuoted?: boolean } = {}) {
  // Track every SQL quote fence so comments/apostrophes inside identifiers
  // ("…", `…`, […]) cannot terminate or re-open the scanner early.
  let fence: '\'' | '"' | '`' | '[' | null = null
  let result = ''
  const stripAll = Boolean(options.removeString)
  const stripSingle = Boolean(options.removeSingleQuoted) && !stripAll

  const strippingFence = (active: NonNullable<typeof fence>) => {
    if (stripAll) {
      return true
    }
    // removeSingleQuoted only drops value literals; identifiers stay visible
    return stripSingle && active === '\''
  }

  for (let i = 0; i < query.length; i++) {
    const char = query[i]
    const nextChar = query[i + 1]

    if (fence) {
      if (fence === '[') {
        if (char === ']') {
          if (!strippingFence(fence)) {
            result += char
          }
          fence = null
        }
        else if (!strippingFence(fence)) {
          result += char
        }
        continue
      }

      if (char === fence) {
        // SQLite escaped quote pair ('' / "" / ``) stays inside the fence
        if (nextChar === fence) {
          if (!strippingFence(fence)) {
            result += char + nextChar
          }
          i += 1
          continue
        }
        if (!strippingFence(fence)) {
          result += char
        }
        fence = null
        continue
      }

      if (!strippingFence(fence)) {
        result += char
      }
      continue
    }

    if (char === '\'' || char === '"' || char === '`' || char === '[') {
      fence = char
      if (!strippingFence(fence)) {
        result += char
      }
      continue
    }

    // Comments are only meaningful outside quoted regions
    if (char === '-' && nextChar === '-') {
      // everything after this is a comment
      return result
    }

    if (char === '/' && nextChar === '*') {
      i += 2
      while (i < query.length && !(query[i] === '*' && query[i + 1] === '/')) {
        i += 1
      }
      i += 2
      continue
    }

    result += char
  }
  return result
}
