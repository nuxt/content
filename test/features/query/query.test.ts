import { assert, describe, test } from 'vitest'
import { createPipelineFetcher } from '../../../src/runtime/query/match/pipeline'
import { createQuery } from '../../../src/runtime/query/query'
import database from './db.json'

const shuffledDatabase: Array<any> = [...database].sort(() => Math.random() - 0.5)
const pipelineFetcher = createPipelineFetcher(() => Promise.resolve(shuffledDatabase))

describe('Database Provider', () => {
  test('Matches nested exact match', async () => {
    const result: Array<any> = await createQuery(pipelineFetcher)
      .where({ 'nested.users.0': 'Ahad' })
      .find()
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
      .find()
    assert(result.length > 0)
    assert(result.every(item => item.nested.users.includes('Pooya')) === true)
  })

  test('Apply limit', async () => {
    const first3 = await createQuery(pipelineFetcher).limit(3).find()
    assert(first3.length === 3)
  })

  test('Apply skip', async () => {
    const first3 = await createQuery(pipelineFetcher).limit(3).find()
    const limit3skip2 = await createQuery(pipelineFetcher).skip(2).limit(3).find()
    assert(limit3skip2[0].id === first3[2].id)
  })

  test('Apply sort', async () => {
    const nameAsc = await createQuery(pipelineFetcher).sort({ name: 1 }).find()
    assert(nameAsc[0].name === database[0].name)

    const nameDesc = await createQuery(pipelineFetcher).sort({ name: 0 }).find()
    assert(nameDesc[0].name === database[database.length - 1].name)
  })

  test('Apply sort and skip', async () => {
    const nameAsc = await createQuery(pipelineFetcher).sort({ name: 1 }).skip(2).find()
    assert(nameAsc[0].name === database[2].name)
  })

  test('Apply $in', async () => {
    const result = await createQuery(pipelineFetcher)
      .where({
        category: { $in: 'c1' }
      })
      .find()
    assert(result.every((item: any) => item.category === 'c1') === true)
  })

  test('Apply $in array', async () => {
    const result = await createQuery(pipelineFetcher)
      .where({
        category: { $in: ['c1', 'c3'] }
      })
      .find()
    assert(result.every((item: any) => ['c1', 'c3'].includes(item.category)) === true)
  })

  test('Apply $or + $in', async () => {
    const result = await createQuery(pipelineFetcher)
      .where({
        $or: [{ category: { $in: 'c1' } }, { category: { $in: 'c2' } }]
      })
      .find()
    assert(result.every((item: any) => ['c1', 'c2'].includes(item.category)) === true)
  })

  test('Apply $contains string', async () => {
    const result = await createQuery(pipelineFetcher)
      .where({
        quote: { $contains: ['best', 'way'] }
      })
      .find()

    assert(result.every((item: any) => item.quote.includes('way')) === true)
  })

  test('Apply $containsAny string', async () => {
    const result = await createQuery(pipelineFetcher)
      .where({
        author: { $containsAny: ['Wilson', 'William'] }
      })
      .find()

    assert(result.every((item: any) => item.author.includes('William')) === false)
    assert(result.every((item: any) => item.author.includes('Wilson')) === false)
    assert(result.every((item: any) => item.author.includes('Wilson') || item.author.includes('William')) === true)
  })

  test('Surround with path (default)', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, path: '/a' }, { id: 2, path: '/b' }, { id: 3, path: '/c' }] as any[]))
    const result = await createQuery(fetcher)
      .findSurround('/b')

    assert(result[0].path === '/a')
    assert(result[1].path === '/c')
  })

  test('Surround more that 1 item with path', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, path: '/a' }, { id: 2, path: '/b' }, { id: 3, path: '/c' }] as any[]))
    const result = await createQuery(fetcher)
      .findSurround('/b', { before: 2, after: 1 })

    assert((result as Array<any>).length === 3)
    assert(result[0] === null)
    assert(result[1].path === '/a')
    assert(result[2].path === '/c')
  })

  test('Surround with object', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, path: '/a' }, { id: 2, path: '/b' }, { id: 3, path: '/c' }] as any[]))
    const result = await createQuery(fetcher)
      .findSurround({ id: 3 }, { before: 2, after: 1 })

    assert((result as Array<any>).length === 3)
    assert(result[0].path === '/a')
    assert(result[1].path === '/b')
    assert(result[2] === null)
  })

  test('Chain multiple where conditions', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, path: '/a' }, { id: 2, path: '/b' }, { id: 3, path: '/c' }] as any[]))
    const query = createQuery(fetcher).where({ id: { $in: [1, 2] } })
    const singleWhereResult = await query.find()

    assert((singleWhereResult as Array<any>).length === 2)
    assert(singleWhereResult[0].path === '/a')
    assert(singleWhereResult[1].path === '/b')

    // Test with second condition
    const doubleWhereResult = await query.where({ path: { $contains: 'b' } }).find()

    assert((doubleWhereResult as Array<any>).length === 1)
    assert(doubleWhereResult[0].path === '/b')
  })
})
