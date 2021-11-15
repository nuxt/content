import { assert } from 'chai'
import LocalQuery from '../../src/runtime/database/providers/local/Query'
import database from '../utils/db.json'

const shuffledDatabase = [...database].sort(() => Math.random() - 0.5)

const createQuery = () => new LocalQuery<any[]>('', { db: shuffledDatabase, deep: true })

describe('Local Database Provider', () => {
  it('nested exact match', async () => {
    const result = await createQuery().where({ 'nested.users.0': 'Ahad' }).fetch()
    assert(result.length > 0)
    assert(result.every(item => item.nested.users.includes('Ahad')) === true)
  })

  it('nested with operator', async () => {
    // $contains
    const result = await createQuery()
      .where({
        'nested.users': {
          $contains: 'Pooya'
        }
      })
      .fetch()
    assert(result.length > 0)
    assert(result.every(item => item.nested.users.includes('Pooya')) === true)
  })

  it('limit', async () => {
    const first3 = await createQuery().limit(3).fetch()
    assert(first3.length === 3)
  })

  it('skip', async () => {
    const first3 = await createQuery().limit(3).fetch()
    const limit3skip2 = await createQuery().skip(2).limit(3).fetch()
    assert(limit3skip2[0].id === first3[2].id)
  })

  it('sort', async () => {
    const nameAsc = await createQuery().sortBy('name', 'asc').fetch()
    assert(nameAsc[0].name === database[0].name)

    const nameDesc = await createQuery().sortBy('name', 'desc').fetch()
    assert(nameDesc[0].name === database[database.length - 1].name)
  })

  it('sort + skip', async () => {
    const nameAsc = await createQuery().sortBy('name', 'asc').skip(2).fetch()
    assert(nameAsc[0].name === database[2].name)
  })

  it('$in', async () => {
    const result = await createQuery()
      .where({
        category: { $in: 'c1' }
      })
      .fetch()
    assert(result.every((item: any) => item.category === 'c1') === true)
  })

  it('$in array', async () => {
    const result = await createQuery()
      .where({
        category: { $in: ['c1', 'c3'] }
      })
      .fetch()
    assert(result.every((item: any) => ['c1', 'c3'].includes(item.category)) === true)
  })

  it('$or + $in', async () => {
    const result = await createQuery()
      .where({
        $or: [{ category: { $in: 'c1' } }, { category: { $in: 'c2' } }]
      })
      .fetch()
    assert(result.every((item: any) => ['c1', 'c2'].includes(item.category)) === true)
  })

  it('$contains string', async () => {
    const result = await createQuery()
      .where({
        quote: { $contains: ['best', 'way'] }
      })
      .fetch()

    assert(result.every((item: any) => item.quote.includes('way')) === true)
  })

  it('$containsAny string', async () => {
    const result = await createQuery()
      .where({
        author: { $containsAny: ['Wilson', 'William'] }
      })
      .fetch()

    assert(result.every((item: any) => item.author.includes('William')) === false)
    assert(result.every((item: any) => item.author.includes('Wilson')) === false)
    assert(result.every((item: any) => item.author.includes('Wilson') || item.author.includes('William')) === true)
  })
})
