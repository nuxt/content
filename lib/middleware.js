const nodeReq = require('node-req')

module.exports = async (req, res) => {
  const url = nodeReq.url(req)
  // Handle SSE
  if (req.sse && url === '/sse') {
    return req.sse.subscribe(req, res)
  }
  // Avoid handle not POST method if not SSE
  if (req.method !== 'POST') { return res.end() }
  // Handle body
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
  const params = JSON.parse(body)
  // Build query from query params
  let query = req.database.query(url)
  if (params.skip) {
    query = query.skip(params.skip)
  }
  if (params.limit) {
    query = query.limit(params.limit)
  }
  if (params.fields) {
    query = query.fields(params.fields)
  }
  if (params.sortBy) {
    for (const sort of params.sortBy) {
      for (const [key, value] of Object.entries(sort)) {
        query = query.sortBy(key, value)
      }
    }
  }
  if (params.where) {
    query = query.where(params.where)
  }
  if (params.search) {
    query = query.search(params.search)
  }

  try {
    // Call fetch method to collect data
    const result = await query.fetch()
    // Return result
    res.end(JSON.stringify(result))
  } catch (e) {
    res.writeHead(404)
    res.end(JSON.stringify({ message: e.message }))
  }
}
