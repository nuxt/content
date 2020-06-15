const nodeReq = require('node-req')
const generateETag = require('etag')
const fresh = require('fresh')

module.exports = ({ ws, database }) => async (req, res) => {
  const url = decodeURI(nodeReq.url(req))

  // Handle WS
  /* istanbul ignore if */
  if (ws && url === '/ws') {
    return ws.serve(req, req.socket, undefined)
  }

  let params = {}

  // Handle body
  /* istanbul ignore else */
  if (req.method === 'POST') {
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
  } else if (req.method === 'GET') {
    params = nodeReq.get(req)
  }
  // Build query from query / body
  let query = database.query(url, { deep: params.deep, text: params.text })
  if (params.sortBy) {
    if (typeof params.sortBy === 'object') {
      if (Array.isArray(params.sortBy)) {
        for (const sort of params.sortBy) {
          for (const [key, value] of Object.entries(sort)) {
            query = query.sortBy(key, value)
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
  if (params.where) {
    query = query.where(params.where)
  }
  if (params.search) {
    if (typeof params.search === 'object') {
      query = query.search(params.search.query, params.search.value)
    } else {
      query = query.search(params.search)
    }
  }
  if (params.surround) {
    query = query.surround(params.surround.slug, params.surround.options)
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  let str
  try {
    // Call fetch method to collect data
    const result = await query.fetch()
    str = JSON.stringify(result)
    const etag = generateETag(str)
    if (fresh(req.headers, { etag })) {
      res.statusCode = 304
      res.end()
      return
    }
    res.setHeader('ETag', etag)
  } catch (e) {
    res.statusCode = 404
    str = JSON.stringify({ message: e.message })
  }
  res.setHeader('Content-Length', Buffer.byteLength(str))
  res.end(str)
}
