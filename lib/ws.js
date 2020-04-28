/* istanbul ignore file */
const WebSocket = require('ws')

class WS {
  constructor (nuxt, options) {
    this.wss = new WebSocket.Server({ noServer: true })
    nuxt.hook('listen', (server) => {
      server.on('upgrade', (request, socket, head) => {
        if (request.url === `/${options.apiPrefix}/ws`) {
          this.handleUpgrade(request, socket, head)
        }
      })
    })
  }

  serve (req) {
    this.handleUpgrade(req, req.socket, undefined)
  }

  handleUpgrade (request, socket, head) {
    return this.wss.handleUpgrade(request, socket, head, (client) => {
      this.wss.emit('connection', client, request)
    })
  }

  /**
   * Publish event and data to all connected clients
   * @param {object} data
   */
  broadcast (data) {
    data = JSON.stringify(data)

    for (const client of this.wss.clients) {
      try {
        client.send(data)
      } catch (err) {
        // Ignore error (if client not ready to receive event)
      }
    }
  }
}

module.exports = WS
