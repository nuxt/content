const nodeReq = require('node-req')

module.exports = async (req, res) => {
  const url = nodeReq.url(req)

  // Handle SSE
  if (req.sse && url === '/sse') {
    return req.sse.subscribe(req, res)
  }

  const result = await req.database.fetch(url)

  res.end(JSON.stringify(result))
}
