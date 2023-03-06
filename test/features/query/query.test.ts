import { assert, describe, expect, test } from 'vitest'
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

    const nameDesc = await createQuery(pipelineFetcher).sort({ name: -1 }).find()
    assert(nameDesc[0].name === database[database.length - 1].name)
  })

  test('Apply sort and skip', async () => {
    const nameAsc = await createQuery(pipelineFetcher).sort({ name: 1 }).skip(2).find()
    assert(nameAsc[0].name === database[2].name)
  })

  test('Apply sort $sensitivity', async () => {
    const textOrder = ['aab', 'aaB', 'aAb', 'aAB', 'Aab', 'AaB', 'AAb', 'AAB']

    const sensitivityCase = await createQuery(pipelineFetcher).sort({ text: 1, $sensitivity: 'case' }).find()
    textOrder.forEach((text, index) => {
      expect(sensitivityCase[index].text).toBe(text)
    })
  })

  test('Apply sort $caseFirst', async () => {
    const textOrder = ['aab', 'aaB', 'aAb', 'aAB', 'Aab', 'AaB', 'AAb', 'AAB']

    const caseLower = await createQuery(pipelineFetcher).sort({ text: 1, $caseFirst: 'lower' }).find()
    textOrder.forEach((text, index) => {
      expect(caseLower[index].text).toBe(text)
    })
    // upper case first
    const caseUpper = await createQuery(pipelineFetcher).sort({ text: 1, $caseFirst: 'upper' }).find()
    textOrder.reverse().forEach((text, index) => {
      expect(caseUpper[index].text).toBe(text)
    })
  })

  test('Apply sort Date', async () => {
    const dates = [
      { date: new Date('2022-01-01 00:00:00.001Z') },
      { date: new Date('2021-01-01 00:00:00.001Z') },
      { date: new Date('2020-01-01 00:00:00.001Z') },
      { date: new Date('2019-01-01 00:00:00.001Z') },
      { date: new Date('2018-01-01 00:00:00.001Z') },
      { date: new Date('1900-01-01 00:00:00.001Z') }
    ]
    const fetcher = createPipelineFetcher(() => Promise.resolve(dates.sort(() => 1 - Math.random())))

    const sortedByDate1 = await createQuery(fetcher).sort({ date: 1 }).find()
    ;([...dates].reverse()).forEach(({ date }, index) => {
      expect(sortedByDate1[index].date).toBe(date)
    })

    const sortedByDate0 = await createQuery(fetcher).sort({ date: -1 }).find()
    dates.forEach(({ date }, index) => {
      expect(sortedByDate0[index].date).toBe(date)
    })
  })

  test('Apply sort $numeric', async () => {
    // sort string alphabetically
    const nonNumericSort = await createQuery(pipelineFetcher).sort({ numberString: 1 }).find()
    const nonNumericOrder = [1, 10, 100, 2, 20, 3, 30, 4]
    nonNumericOrder.forEach((number, index) => {
      expect(nonNumericSort[index].numberString).toBe(String(number))
    })

    // sort string numerically
    const numericSort = await createQuery(pipelineFetcher).sort({ numberString: 1, $numeric: true }).find()
    const numericOrder = [1, 2, 3, 4, 10, 20, 30, 100]
    numericOrder.forEach((number, index) => {
      expect(numericSort[index].numberString).toBe(String(number))
    })
  })

  test('Sort Nullable fields', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, name: 'Saman' }, { id: 2, name: 'Ebi' }, { id: 3, name: 'Narges' }, { id: 4, name: null }] as any[]))
    const result = await createQuery(fetcher)
      .sort({ name: 1 })
      .find()

    assert(result[0].name === 'Ebi')
    assert(result[1].name === 'Narges')
    assert(result[2].name === 'Saman')
    assert(result[3].name === null)
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
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))
    const result = await createQuery(fetcher)
      .findSurround('/b')

    assert(result[0]._path === '/a')
    assert(result[1]._path === '/c')
  })

  test('Surround more that 1 item with path', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))
    const result = await createQuery(fetcher)
      .findSurround('/b', { before: 2, after: 1 })

    assert((result as Array<any>).length === 3)
    assert(result[0] === null)
    assert(result[1]._path === '/a')
    assert(result[2]._path === '/c')
  })

  test('Surround with 0 item before', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))
    const result = await createQuery(fetcher)
      .findSurround('/b', { before: 0, after: 1 })

    assert((result as Array<any>).length === 1)
    assert(result[0]._path === '/c')
  })

  test('Surround with 0 item after', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))
    const result = await createQuery(fetcher)
      .findSurround('/b', { before: 1, after: 0 })

    assert((result as Array<any>).length === 1)
    assert(result[0]._path === '/a')
  })

  test('Surround with object', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))
    const result = await createQuery(fetcher)
      .findSurround({ id: 3 }, { before: 2, after: 1 })

    assert((result as Array<any>).length === 3)
    assert(result[0]._path === '/a')
    assert(result[1]._path === '/b')
    assert(result[2] === null)
  })

  test('Surround and using only method', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))
    const result = await createQuery(fetcher)
      .only(['_path'])
      .findSurround({ id: 3 }, { before: 2, after: 1 })

    assert((result as Array<any>).length === 3)
    assert(result[0]._path === '/a')
    assert(result[1]._path === '/b')
    assert(result[2] === null)
  })

  test('Surround and using without method', async () => {
    const fetcher = createPipelineFetcher(() => Promise.resolve([{ id: 1, _path: '/a' }, { id: 2, _path: '/b' }, { id: 3, _path: '/c' }] as any[]))
    const result = await createQuery(fetcher)
      .without('id')
      .findSurround({ id: 3 }, { before: 2, after: 1 })

    assert((result as Array<any>).length === 3)
    assert(result[0]._path === '/a')
    assert(result[1]._path === '/b')
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

  test('Select specific keys', async () => {
    const query = createQuery(pipelineFetcher)
      .where({ id: { $in: [1, 2] } })
      .only(['name', 'id', '_'])
    const result = await query.find()

    expect(result.length).toBeGreaterThan(0)
    result.forEach((item) => {
      expect(Object.keys(item)).toMatchObject(['id', 'name', '_deleted'])
    })
  })

  test('Drop specific keys', async () => {
    const query = createQuery(pipelineFetcher)
      .where({ id: { $in: [1, 2] } })
      .without(['name', '_'])
    const result = await query.find()

    expect(result.length).toBeGreaterThan(0)
    result.forEach((item) => {
      expect(item.id).toBeDefined()
      expect(item.name).toBeUndefined()
      expect(item._deleted).toBeUndefined()
    })
  })
})
