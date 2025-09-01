import sqliteConnector from 'db0/connectors/node-sqlite'

// When using the SQLite Node.js prints warnings about the experimental feature
// This is workaround to surpass the SQLite warning
// Inspired by Yarn https://github.com/yarnpkg/berry/blob/182046546379f3b4e111c374946b32d92be5d933/packages/yarnpkg-pnp/sources/loader/applyPatch.ts#L307-L328
const originalEmit = process.emit
// @ts-expect-error - TS complains about the return type of originalEmit.apply
process.emit = function (...args) {
  const name = args[0]
  const data = args[1] as { name: string, message: string }
  if (
    name === `warning`
    && typeof data === `object`
    && data.name === `ExperimentalWarning`
    && data.message.includes(`SQLite is an experimental feature`)
  ) {
    return false
  }
  return originalEmit.apply(process, args as unknown as Parameters<typeof process.emit>)
}

export default sqliteConnector
