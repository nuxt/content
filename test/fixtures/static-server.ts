import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join } from 'node:path'

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
}

/** A static host: files from `dir`, `index.html` for directories, 404 for anything else. */
export function serveStatic(dir: string) {
  return createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url!, 'http://localhost').pathname)
    for (const file of [join(dir, pathname), join(dir, pathname, 'index.html')]) {
      try {
        const body = await readFile(file)
        res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
        return res.end(body)
      }
      catch {
        // Not this candidate.
      }
    }
    res.writeHead(404).end()
  })
}
