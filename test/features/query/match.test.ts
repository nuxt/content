import { describe, expect, test } from 'vitest'
import { createMatch } from '../../../src/runtime/query/match'

describe('Match', () => {
  const match = createMatch()

  const item = {
    id: 1,
    name: 'a',
    to: 'a',
    live: true,
    category: 'c1',
    nested: { users: ['Mahatma', 'Steve', 'Woodrow'] }
  }

  describe('String contains', () => {
    test('$contains string', () => {
      expect(match(item, { name: { $contains: 'a' } })).toBe(true)
      expect(match(item, { 'nested.users.0': { $contains: 'Maha' } })).toBe(true)

      // Does not match case insensitive
      expect(match(item, { 'nested.users.0': { $contains: 'maha' } })).toBe(false)

      // match multiple conditions
      expect(match(item, { 'nested.users.0': { $contains: ['Maha', 'tma'] } })).toBe(true)

      expect(match({ values: [0, false, ''] }, { values: { $contains: '' } })).toBe(true)
      expect(match({ values: [0, false, ''] }, { values: { $contains: 0 } })).toBe(true)
      expect(match({ values: [0, false, ''] }, { values: { $contains: false } })).toBe(true)
    })

    test('$icontains string', () => {
      expect(match(item, { 'nested.users.1': { $icontains: 'steve' } })).toBe(true)
      expect(match(item, { 'nested.users.2': { $icontains: 'WOODROW' } })).toBe(true)
    })
  })

  describe('Array contains', () => {
    test('$contains array', () => {
      expect(match(item, { 'nested.users': { $contains: 'Steve' } })).toBe(true)
      expect(match(item, { 'nested.users': { $contains: 'Woodrow' } })).toBe(true)
      expect(match(item, { 'nested.users': { $contains: ['Woodrow', 'Steve'] } })).toBe(true)
      expect(match(item, { 'nested.users': { $contains: ['Woodrow', 'Steve', 'Mahatma'] } })).toBe(true)
      expect(match(item, { 'nested.users': { $contains: ['Woodrow', 'Steve', 'Mahatma', 'John'] } })).toBe(false)
      expect(match(item, { 'nested.users': { $contains: '' } })).toBe(false)
      expect(match(item, { 'nested.users': { $contains: 0 } })).toBe(false)
      expect(match(item, { 'nested.users': { $contains: false } })).toBe(false)
      expect(match(item, { 'nested.users': { $contains: null } })).toBe(true)
      expect(match(item, { 'nested.users': { $contains: undefined } })).toBe(true)
    })

    test('$containsAny', () => {
      expect(match(item, { 'nested.users': { $containsAny: ['Steve', 'Woodrow'] } })).toBe(true)
      expect(match(item, { 'nested.users': { $containsAny: ['Steve', 'Woodrow', 'Mahatma'] } })).toBe(true)
      expect(match(item, { 'nested.users': { $containsAny: ['Steve', 'Woodrow', 'Mahatma', 'John'] } })).toBe(true)
      expect(match(item, { 'nested.users': { $containsAny: ['John', 'Paul'] } })).toBe(false)
      expect(match(item, { 'nested.users': { $containsAny: ['John', 'Paul', 'Steve'] } })).toBe(true)
    })
  })

  describe('Types and existence', () => {
    test('$exists', () => {
      expect(match(item, { name: { $exists: true } })).toBe(true)
      expect(match(item, { title: { $exists: true } })).toBe(false)
      expect(match(item, { title: { $exists: false } })).toBe(true)

      expect(match(item, { 'nested.users': { $exists: true } })).toBe(true)
      expect(match(item, { 'nested.users.1': { $exists: true } })).toBe(true)
      expect(match(item, { 'nested.users.4': { $exists: false } })).toBe(true)
      expect(match(item, { 'nested.users.4': { $exists: true } })).toBe(false)
    })

    test('$type', () => {
      expect(match(item, { name: { $type: 'string' } })).toBe(true)
      expect(match(item, { name: { $type: 'number' } })).toBe(false)

      expect(match(item, { title: { $type: 'undefined' } })).toBe(true)

      expect(match(item, { nested: { $type: 'object' } })).toBe(true)

      expect(match(item, { 'nested.users': { $type: 'object' } })).toBe(true)
      expect(match(item, { 'nested.users.0': { $type: 'string' } })).toBe(true)
    })
  })

  test('$eq', () => {
    // string
    expect(match(item, { name: { $eq: 'a' } })).toBe(true)
    expect(match(item, { name: { $eq: 'A' } })).toBe(false)

    // number
    expect(match(item, { id: { $eq: 1 } })).toBe(true)
    expect(match(item, { id: { $eq: '1' } })).toBe(false)

    // boolean
    expect(match(item, { live: { $eq: true } })).toBe(true)
    expect(match(item, { live: { $eq: 'true' } })).toBe(false)
  })

  test('$ne', () => {
    // string
    expect(match(item, { name: { $ne: 'a' } })).toBe(false)
    expect(match(item, { name: { $ne: 'A' } })).toBe(true)

    // number
    expect(match(item, { id: { $ne: '1' } })).toBe(true)
    expect(match(item, { id: { $ne: 1 } })).toBe(false)

    // boolean
    expect(match(item, { live: { $ne: 'true' } })).toBe(true)
    expect(match(item, { live: { $ne: true } })).toBe(false)
  })

  describe('Logical operators', () => {
    test('$not', () => {
      // string
      expect(match(item, { $not: { live: true } })).toBe(false)
      expect(match(item, { live: { $not: true } })).toBe(false)
      expect(match(item, { live: { $not: { $eq: true } } })).toBe(false)
    })

    test('$and', () => {
      expect(
        match(item, {
          $and: [{ name: 'a' }, { live: true }]
        })
      ).toBe(true)

      expect(
        match(item, {
          $and: [{ name: 'a' }, { live: false }]
        })
      ).toBe(false)
    })

    test('$or', () => {
      expect(
        match(item, {
          $or: [{ name: 'a' }, { live: true }]
        })
      ).toBe(true)

      expect(
        match(item, {
          $or: [{ name: 'a' }, { live: false }]
        })
      ).toBe(true)
    })

    test('$regex', () => {
      // case sensitive
      expect(match(item, { 'nested.users.0': /maha/ })).toBe(false)
      expect(match(item, { 'nested.users.0': { $regex: '/maha/' } })).toBe(false)
      expect(match(item, { 'nested.users.0': { $regex: 'maha' } })).toBe(false)

      // case insensitive
      expect(match(item, { 'nested.users.0': '/maha/i' })).toBe(false)
      expect(match(item, { 'nested.users.0': /maha/i })).toBe(true)
      expect(match(item, { 'nested.users.0': { $regex: '/maha/i' } })).toBe(true)

      // with `$not`
      expect(match(item, { 'nested.users.0': { $not: /maha/i } })).toBe(false)
      expect(match(item, { 'nested.users.0': { $not: /maha/ } })).toBe(true)
    })
  })

  describe('Numerical operators', () => {
    test('$gt', () => {
      expect(match(item, { id: { $gt: 0 } })).toBe(true)
      expect(match(item, { id: { $gt: 1 } })).toBe(false)
    })

    test('$gte', () => {
      expect(match(item, { id: { $gte: 1 } })).toBe(true)
      expect(match(item, { id: { $gte: 2 } })).toBe(false)
    })

    test('$lt', () => {
      expect(match(item, { id: { $lt: 2 } })).toBe(true)
      expect(match(item, { id: { $lt: 1 } })).toBe(false)
    })

    test('$lte', () => {
      expect(match(item, { id: { $lte: 1 } })).toBe(true)
      expect(match(item, { id: { $lte: 0 } })).toBe(false)
    })
  })

  describe('$in ', () => {
    test('string filed', () => {
      const item = { id: 1, name: 'a', to: 'a', category: 'c1', nested: { users: ['Mahatma', 'Steve', 'Woodrow'] } }

      expect(match(item, { name: { $in: ['a', 'b'] } })).toBe(true)
      expect(match(item, { category: { $in: 'c1' } })).toBe(true)
      expect(match(item, { category: { $in: ['c1', 'c2'] } })).toBe(true)
      expect(match(item, { category: { $in: ['c2', 'c3'] } })).toBe(false)

      expect(match(item, { id: { $in: [1, 2] } })).toBe(true)
    })

    test('array field', () => {
      const data = [
        {
          name: 'post1',
          tags: ['school', 'office']
        },
        {
          name: 'post2',
          tags: ['school', 'home']
        },
        {
          item: 'Maps',
          tags: ['office', 'storage']
        }
      ]

      const condition = { tags: { $in: ['school', 'home'] } }
      data.forEach((item) => {
        expect(match(item, condition)).toBe(
          item.tags.includes(condition.tags.$in[0]) ||
          item.tags.includes(condition.tags.$in[1])
        )
      })
    })
  })
})
