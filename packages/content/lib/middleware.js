const { join } = require('path')
const fs = require('graceful-fs').promises
const nodeReq = require('node-req')
const nodeRes = require('node-res')

module.exports = ({ ws, database, dir, watch }) => async (req, res) => {
  const url = decodeURI(nodeReq.url(req))

  // Handle WS
  /* istanbul ignore if */
  if (ws && url === '/ws') {
    return ws.serve(req, req.socket, undefined)
  }

  let params = {}

  // Handle body
  /* istanbul ignore else */
  if (['POST', 'PUT'].includes(req.method)) {
    // If other server middleware has already consumed stream,
    // there is no longer body data to wait (see #292)
    if (req.readableEnded) {
      params = req.body
    } else {
      let body = ''
      req.on('data', function (data) {
        body += data
      })
      // Wait for body data
      await new Promise(function (resolve, reject) {
        req.on('end', resolve)
        req.on('error', reject)
      })
      // Parse body
      if (body) {
        params = JSON.parse(body)
      }
    }
  } else if (req.method === 'GET') {
    params = nodeReq.get(req)
  }

  if (watch) {
    const filePath = join(dir, url)
    const stats = await fs.lstat(filePath).catch(_ => null)
    if (req.method === 'PUT' && stats && stats.isFile()) {
      await fs.writeFile(filePath, params.file, 'utf-8')

      return nodeRes.send(req, res, {})
    }

    if (req.method === 'GET' && stats && stats.isFile()) {
      const file = await fs.readFile(filePath, 'utf-8')

      return nodeRes.send(req, res, file)
    }
  }

  const { sortBy, skip, limit, only, without, where, search, surround, deep, text, ...other } = params
  params.where = Object.assign({}, params.where, other)

  // Build query from query / body
  let query = database.query(url, { deep: params.deep, text: params.text })
  if (params.sortBy) {
    if (typeof params.sortBy === 'object') {
      if (Array.isArray(params.sortBy)) {
        for (const sort of params.sortBy) {
          if (typeof sort === 'string') {
            const [key, value] = sort.split(':')
            query = query.sortBy(key, value)
          } else {
            for (const [key, value] of Object.entries(sort)) {
              query = query.sortBy(key, value)
            }
          }
        }
      } else {
        for (const [key, value] of Object.entries(params.sortBy)) {
          query = query.sortBy(key, value)
        }
      }
    } else {
      const [key, value] = params.sortBy.split(':')
      query = query.sortBy(key, value)
    }
  }
  if (params.skip) {
    query = query.skip(params.skip)
  }
  if (params.limit) {
    query = query.limit(params.limit)
  }
  if (params.only) {
    query = query.only(params.only)
  }
  if (params.without) {
    query = query.without(params.without)
  }
  if (params.where) {
    const where = {}

    for (const [key, value] of Object.entries(params.where)) {
      const [field, operator] = key.split('_')

      if (operator) {
        where[field] = {
          [`$${operator}`]: value
        }
      } else {
        where[field] = value
      }
    }
    query = query.where(where)
  }
  if (params.search) {
    if (typeof params.search === 'object') {
      query = query.search(params.search.query, params.search.value)
    } else {
      query = query.search(params.search)
    }
  }
  if (params.surround) {
    query = query.surround(params.surround.slugOrPath, params.surround.options)
  }

  let result
  try {
    // Call fetch method to collect data
    result = await query.fetch()
    nodeRes.etag(res, JSON.stringify(result))
    if (nodeReq.fresh(req, res)) {
      nodeRes.status(res, 304)
      nodeRes.end(res)
      return
    }
  } catch (e) {
    nodeRes.status(res, 404)
    result = { message: e.message }
  }
  nodeRes.send(req, res, result, false) // don't regenerate etags
}
