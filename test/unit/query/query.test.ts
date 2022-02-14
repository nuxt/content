import { assert, describe, test } from 'vitest'
import { createPipelineFetcher } from '../../../src/runtime/query/match/pipeline'
import { createQuery } from '../../../src/runtime/query/query'
import database from './db.json'

const shuffledDatabase: Array<any> = [...database].sort(() => Math.random() - 0.5)
const pipelineFetcher = createPipelineFetcher(() => Promise.resolve(shuffledDatabase), [])

describe('Database Provider', () => {
  test('Matches nested exact match', async () => {
    const result: Array<any> = await createQuery(pipelineFetcher)
      .where({ 'nested.users.0': 'Ahad' })
      .fetch()
    assert(result.length > 0)
    assert(result.every(item => item.nested.users.includes('Ahad')) === true)
  })

  test('Matches nested with operator', async () => {
    // $contains
    const result: Array<any> = await createQuery(pipelineFetcher)
      .where({
        'nested.users': {
          $contains: 'Pooya'
        }
      })
      .fetch()
    assert(result.length > 0)
    assert(result.every(item => item.nested.users.includes('Pooya')) === true)
  })

  test('Apply limit', async () => {
    const first3 = await createQuery(pipelineFetcher).limit(3).fetch()
    assert(first3.length === 3)
  })

  test('Apply skip', async () => {
    const first3 = await createQuery(pipelineFetcher).limit(3).fetch()
    const limit3skip2 = await createQuery(pipelineFetcher).skip(2).limit(3).fetch()
    assert(limit3skip2[0].id === first3[2].id)
  })

  test('Apply sort', async () => {
    const nameAsc = await createQuery(pipelineFetcher).sortBy('name', 'asc').fetch()
    assert(nameAsc[0].name === database[0].name)

    const nameDesc = await createQuery(pipelineFetcher).sortBy('name', 'desc').fetch()
    assert(nameDesc[0].name === database[database.length - 1].name)
  })

  test('Apply sort and skip', async () => {
    const nameAsc = await createQuery(pipelineFetcher).sortBy('name', 'asc').skip(2).fetch()
    assert(nameAsc[0].name === database[2].name)
  })

  test('Apply $in', async () => {
    const result = await createQuery(pipelineFetcher)
      .where({
        category: { $in: 'c1' }
      })
      .fetch()
    assert(result.every((item: any) => item.category === 'c1') === true)
  })

  test('Apply $in array', async () => {
    const result = await createQuery(pipelineFetcher)
      .where({
        category: { $in: ['c1', 'c3'] }
      })
      .fetch()
    assert(result.every((item: any) => ['c1', 'c3'].includes(item.category)) === true)
  })

  test('Apply $or + $in', async () => {
    const result = await createQuery(pipelineFetcher)
      .where({
        $or: [{ category: { $in: 'c1' } }, { category: { $in: 'c2' } }]
      })
      .fetch()
    assert(result.every((item: any) => ['c1', 'c2'].includes(item.category)) === true)
  })

  test('Apply $contains string', async () => {
    const result = await createQuery(pipelineFetcher)
      .where({
        quote: { $contains: ['best', 'way'] }
      })
      .fetch()

    assert(result.every((item: any) => item.quote.includes('way')) === true)
  })

  test('Apply $containsAny string', async () => {
    const result = await createQuery(pipelineFetcher)
      .where({
        author: { $containsAny: ['Wilson', 'William'] }
      })
      .fetch()

    assert(result.every((item: any) => item.author.includes('William')) === false)
    assert(result.every((item: any) => item.author.includes('Wilson')) === false)
    assert(result.every((item: any) => item.author.includes('Wilson') || item.author.includes('William')) === true)
  })

  test('Surround with slug (default)', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, slug: '/a' }, { id: 2, slug: '/b' }, { id: 3, slug: '/c' }]), [])
    const result = await createQuery(fetcher)
      .surround('/b')
      .fetch()

    assert(result[0].slug === '/a')
    assert(result[1].slug === '/c')
  })

  test('Surround more that 1 item with slug', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, slug: '/a' }, { id: 2, slug: '/b' }, { id: 3, slug: '/c' }]), [])
    const result = await createQuery(fetcher)
      .surround('/b', { before: 2, after: 1 })
      .fetch()

    assert((result as Array<any>).length === 3)
    assert(result[0] === null)
    assert(result[1].slug === '/a')
    assert(result[2].slug === '/c')
  })

  test('Surround with object', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, slug: '/a' }, { id: 2, slug: '/b' }, { id: 3, slug: '/c' }]), [])
    const result = await createQuery(fetcher)
      .surround({ id: 3 }, { before: 2, after: 1 })
      .fetch()

    assert((result as Array<any>).length === 3)
    assert(result[0].slug === '/a')
    assert(result[1].slug === '/b')
    assert(result[2] === null)
  })
})
