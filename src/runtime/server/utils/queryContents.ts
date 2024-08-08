import { createMatch } from '../../content-v2-support-utils/match'

export const queryContents = <T>(collection: string) => {
  const params = {
    select: '*',
    where: [] as Array<any>,
    skip: 0,
    limit: 0,
  }

  const query = {
    path(path: string) {
      params.where.push({ path: path })
      return query
    },
    skip(skip: number) {
      params.skip = skip
      return query
    },
    where(field: string, operator: '=' | '>' | '<' | 'in', value: any) {
      params.where.push({ [field]: { [operator]: value } })
      return query
    },
    select<K extends keyof T>(...fields: K[]) {
      params.select = fields.join(', ')
      return query
    },
    limit(limit: number) {
      params.limit = limit
      return query
    },
    async all() {
      const sql = `SELECT ${params.select} FROM ${collection} ${generateWhere()} ${generateLimitAndSkip()}`
      return $fetch<T[]>(`/api/query?q=${encodeURIComponent(sql)}`)
    },
    async first() {
      const sql = `SELECT ${params.select} FROM ${collection} ${generateWhere()} ${generateLimitAndSkip()}`
      return $fetch<T[]>(`/api/query?q=${encodeURIComponent(sql)}`).then(res => res[0])
    },
  }

  function generateLimitAndSkip() {
    if (params.limit && params.skip) {
      return `LIMIT ${params.limit} OFFSET ${params.skip}`
    }
    else if (params.limit) {
      return `LIMIT ${params.limit}`
    }
    return ''
  }

  function generateWhere() {
    const match = createMatch()

    const where = params.where || []
    return where.length > 0 ? `WHERE ${where.map(w => match('content', w)).join(' AND ')}` : ''
  }

  return query
}
