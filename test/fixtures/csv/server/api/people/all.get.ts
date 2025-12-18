import { eventHandler } from 'h3'
import { queryCollection } from '@nuxt/content/server'

export default eventHandler(async (event) => {
  const people = await queryCollection(event, 'people' as never)
    .order('id', 'ASC')
    .all()

  return people
})
