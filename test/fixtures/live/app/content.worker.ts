import { createNuxtContentWorker, sqliteFullTextSearch, sqliteWasm } from '@nuxt/content/worker'

export default createNuxtContentWorker({
  plugins: [sqliteFullTextSearch({ database: sqliteWasm() })],
})
