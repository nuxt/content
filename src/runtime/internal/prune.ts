import type { DatabaseAdapter } from '@nuxt/content'

/**
 * Pruning of unused table prefixes.
 *
 * Deployments that share one database with distinct `tablePrefix` (preview deployments of
 * several branches, typically) leave their tables behind once they are gone. With
 * `pruneUnusedPrefixes`, every deployment keeps a heartbeat row in its own `<prefix>info`
 * table, and drops the tables of the other prefixes whose heartbeat is older than `maxAge`.
 *
 * - Only prefixes that keep a heartbeat are pruned: a deployment that didn't enable the option
 *   is never touched.
 * - Tables are found by exact name, from the `checksum_<collection>` rows of the info table.
 *   Never by prefix: `_preview_feat_` is a prefix of `_preview_feat_x_`, which may be alive.
 * - Pruning is recoverable: a pruned deployment that gets traffic again notices it (see
 *   `refreshHeartbeat`) and imports its bundled dump again.
 */

export const HEARTBEAT_ID = 'heartbeat'
/**
 * Heartbeat value set on a prefix that is being pruned
 */
export const PRUNED = 'pruned'

const IDENTIFIER = /^\w+$/
const CHECKSUM_PREFIX = 'checksum_'
const DEFAULT_TABLE_PREFIX = '_content_'

export type DatabaseDialect = 'sqlite' | 'postgres'

/**
 * Read the heartbeat of an info table.
 * @returns the heartbeat value, `null` when there is no heartbeat, `undefined` when the table can't be read
 */
export async function readHeartbeat(db: DatabaseAdapter, infoTable: string): Promise<string | null | undefined> {
  return db.first<{ version: string }>(`SELECT version FROM ${infoTable} WHERE id = ?`, [HEARTBEAT_ID])
    .then(row => row ? String(row.version) : null)
    .catch(() => undefined)
}

export type HeartbeatStatus = 'alive' | 'pruned' | 'missing'

/**
 * Refresh the heartbeat of an info table, unless another deployment is pruning it: the
 * `pruned` mark is never overwritten, the owner has to take its tables back first.
 * @returns `missing` when the info table doesn't exist, `pruned` when another deployment
 * claimed it, `alive` otherwise
 */
export async function refreshHeartbeat(db: DatabaseAdapter, infoTable: string, now: number): Promise<HeartbeatStatus> {
  try {
    await db.exec(
      `INSERT INTO ${infoTable} ("id", "version", "structureVersion", "ready") VALUES (?, ?, '', true)`
      + ` ON CONFLICT ("id") DO UPDATE SET "version" = excluded."version" WHERE ${infoTable}."version" <> ?`,
      [HEARTBEAT_ID, String(now), PRUNED],
    )
  }
  catch {
    return 'missing'
  }
  return await readHeartbeat(db, infoTable) === PRUNED ? 'pruned' : 'alive'
}

export interface PruneOptions {
  /**
   * Info table of the current deployment, never pruned
   */
  infoTable: string
  /**
   * Prune prefixes whose heartbeat is older than this, in milliseconds
   */
  maxAge: number
  now: number
  dialect: DatabaseDialect
  /**
   * Maximum number of prefixes to prune in one run, to keep each run short
   * @default 5
   */
  limit?: number
}

/**
 * Drop the tables of the prefixes whose heartbeat is older than `maxAge`.
 * @returns the dropped tables
 */
export async function pruneUnusedPrefixes(db: DatabaseAdapter, { infoTable, maxAge, now, dialect, limit = 5 }: PruneOptions): Promise<string[]> {
  const tables = new Set(await listTables(db, dialect))
  const dropped: string[] = []
  let pruned = 0

  for (const candidate of tables) {
    if (pruned >= limit) {
      break
    }
    if (candidate === infoTable || !candidate.endsWith('info') || !IDENTIFIER.test(candidate)) {
      continue
    }

    // Tables of a data collection may end with `info` too: only an info table with a
    // heartbeat belongs to a deployment that opted in to pruning.
    const heartbeat = await readHeartbeat(db, candidate)
    if (!heartbeat) {
      continue
    }
    const lastSeen = Number(heartbeat)
    if (heartbeat !== PRUNED && !(Number.isFinite(lastSeen) && now - lastSeen > maxAge)) {
      continue
    }

    // Claim the prefix. Conditional, so a deployment that came back in the meantime keeps it.
    await db.exec(`UPDATE ${candidate} SET "version" = ? WHERE id = ? AND "version" = ?`, [PRUNED, HEARTBEAT_ID, heartbeat])
    const stillPruned = async () => await readHeartbeat(db, candidate) === PRUNED
    if (!await stillPruned()) {
      continue
    }

    const prefix = candidate.slice(0, -'info'.length)
    const checksums = await db.all<{ id: string }>(`SELECT id FROM ${candidate} WHERE id LIKE ?`, [`${CHECKSUM_PREFIX}%`])
    const collectionTables = checksums
      .map(row => String(row.id))
      .filter(id => id.startsWith(CHECKSUM_PREFIX))
      .map(id => prefix + id.slice(CHECKSUM_PREFIX.length))
    if (prefix !== DEFAULT_TABLE_PREFIX) {
      // Full-text search index of this prefix, see `search.ts`
      collectionTables.push(`_fts_search${prefix}`)
    }

    pruned++
    // Info table last: if a run stops halfway, the next one finds this prefix again
    for (const table of [...collectionTables.filter(t => t !== candidate && tables.has(t) && IDENTIFIER.test(t)), candidate]) {
      // The owner refreshes its heartbeat as soon as it notices: stop there
      if (!await stillPruned()) {
        break
      }
      await db.exec(`DROP TABLE IF EXISTS ${table}`)
      dropped.push(table)
    }
  }

  return dropped
}

export async function listTables(db: DatabaseAdapter, dialect: DatabaseDialect): Promise<string[]> {
  const rows = dialect === 'postgres'
    ? await db.all<{ name: string }>(`SELECT table_name AS name FROM information_schema.tables WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'`)
    : await db.all<{ name: string }>(`SELECT name FROM sqlite_master WHERE type = 'table'`)
  return rows.map(row => String(row.name))
}
