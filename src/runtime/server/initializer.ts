import useDatabaseAdaptor from './adaptors'
import parsedContents from '#content-v3/dump.mjs'

export default async () => {
  const db = useDatabaseAdaptor()

  await Promise.all(parsedContents.map(sql => db.exec(sql)))
}
