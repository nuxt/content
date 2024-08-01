import { eventHandler, setHeader } from 'h3'

export default eventHandler(async (event) => {
  // This enables SharedArrayBuffer to work in the browser which is required for SQLite in the browser
  setHeader(event, 'Cross-Origin-Opener-Policy', 'same-origin')
  setHeader(event, 'Cross-Origin-Embedder-Policy', 'require-corp')
})
