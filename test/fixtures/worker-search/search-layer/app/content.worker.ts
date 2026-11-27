import { createNuxtContentWorker, sqliteFullTextSearch, sqliteWasm } from '@nuxt/content/worker'

// One database for every instance, so a search across them is ranked as one index.
export default createNuxtContentWorker({
  plugins: [sqliteFullTextSearch({ database: sqliteWasm() })],
})
