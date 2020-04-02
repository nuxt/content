const nodeReq = require('node-req')

module.exports = (req, res) => {
  const url = nodeReq.url(req)

  // Handle SSE
  if (req.sse && url === '/sse') {
    return req.sse.subscribe(req, res)
  }

  const items = req.database.query(url).data()

  res.end(JSON.stringify(items))
}
