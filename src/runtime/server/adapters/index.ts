import loadDatabaseAdapter from '../../internal/database.server'
import { useRuntimeConfig } from '#imports'

export default function useContentDatabase() {
  const { database, localDatabase } = useRuntimeConfig().content

  return loadDatabaseAdapter({ database, localDatabase })
}
