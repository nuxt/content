import useDatabaseAdaptor from './adaptors'
import parsedContents from '#content-v3/dump'

export default async () => {
  const db = useDatabaseAdaptor()

  await parsedContents().reduce(async (prev: Promise<void>, sql: string) => {
    await prev

    await db.exec(sql)
  }, Promise.resolve())

  return true
}
