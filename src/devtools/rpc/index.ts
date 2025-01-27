import type { DevtoolsServerContext, ServerFunctions } from '../../types'
import { setupSqliteRPC } from './sqlite'

export function setupRPC(ctx: DevtoolsServerContext): ServerFunctions {
  return {
    getOptions() {
      return ctx.options
    },

    ...setupSqliteRPC(ctx),

    async reset() {
      const ws = await ctx.wsServer
      ws.send('nuxt-mongoose:reset')
    },
  }
}
