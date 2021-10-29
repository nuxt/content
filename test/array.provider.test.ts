import ArrayQuery from '../src/runtime/database/providers/local/Query'
import database from './utils/db.json'

const shuffledDatabase = [...database].sort(() => Math.random() - 0.5)

const createQuery = () => new ArrayQuery<any[]>('', { db: shuffledDatabase, deep: true })

describe('module', () => {
  test('nested exact match', async () => {
    const result = await createQuery().where({ 'nested.users.0': 'Ahad' }).fetch()
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(item => item.nested.users.includes('Ahad'))).toBeTruthy()
  })

  test('nested with operator', async () => {
    // $contains
    const result = await createQuery()
      .where({
        'nested.users': {
          $contains: 'Pooya'
        }
      })
      .fetch()
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(item => item.nested.users.includes('Pooya'))).toBeTruthy()
  })

  test('limit', async () => {
    const first3 = await createQuery().limit(3).fetch()
    expect(first3.length).toEqual(3)
  })

  test('skip', async () => {
    const first3 = await createQuery().limit(3).fetch()
    const limit3skip2 = await createQuery().skip(2).limit(3).fetch()
    expect(limit3skip2[0].id).toEqual(first3[2].id)
  })

  test('sort', async () => {
    const nameAsc = await createQuery().sortBy('name', 'asc').fetch()
    expect(nameAsc[0].name).toEqual(database[0].name)

    const nameDesc = await createQuery().sortBy('name', 'desc').fetch()
    expect(nameDesc[0].name).toEqual(database[database.length - 1].name)
  })

  test('sort + skip', async () => {
    const nameAsc = await createQuery().sortBy('name', 'asc').skip(2).fetch()
    expect(nameAsc[0].name).toEqual(database[2].name)
  })

  test('$in', async () => {
    const result = await createQuery()
      .where({
        category: { $in: 'c1' }
      })
      .fetch()
    expect(result.every((item: any) => item.category === 'c1')).toBeTruthy()
  })

  test('$in array', async () => {
    const result = await createQuery()
      .where({
        category: { $in: ['c1', 'c3'] }
      })
      .fetch()
    expect(result.every((item: any) => ['c1', 'c3'].includes(item.category))).toBeTruthy()
  })

  test('$or + $in', async () => {
    const result = await createQuery()
      .where({
        $or: [{ category: { $in: 'c1' } }, { category: { $in: 'c2' } }]
      })
      .fetch()
    expect(result.every((item: any) => ['c1', 'c2'].includes(item.category))).toBeTruthy()
  })

  test('$contains string', async () => {
    const result = await createQuery()
      .where({
        quote: { $contains: ['best', 'way'] }
      })
      .fetch()

    expect(result.every((item: any) => item.quote.includes('way'))).toBeTruthy()
  })

  test('$containsAny string', async () => {
    const result = await createQuery()
      .where({
        author: { $containsAny: ['Wilson', 'William'] }
      })
      .fetch()

    expect(result.every((item: any) => item.author.includes('William'))).toBeFalsy()
    expect(result.every((item: any) => item.author.includes('Wilson'))).toBeFalsy()
    expect(result.every((item: any) => item.author.includes('Wilson') || item.author.includes('William'))).toBeTruthy()
  })
})
