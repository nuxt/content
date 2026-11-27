import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Start the Vercel function of the build in `outputDir` alone, without its static files. */
export async function startVercelFunction(outputDir: string, env: Record<string, string> = {}) {
  const entry = join(outputDir, 'functions/__fallback.func/index.mjs')
  const fn = spawn(process.execPath, ['--input-type=module', '-e', `
    import { createServer } from 'node:http'
    const { default: handler } = await import(${JSON.stringify(pathToFileURL(entry).href)})
    const server = createServer(handler).listen(0, () => console.log('port=' + server.address().port))
  `], { env: { ...process.env, ...env } })
  let output = ''
  fn.stderr!.on('data', data => output += data)
  const port = await new Promise<string>((resolve, reject) => {
    fn.stdout!.on('data', (data) => {
      output += data
      const match = String(data).match(/port=(\d+)/)
      if (match) resolve(match[1]!)
    })
    fn.once('exit', code => reject(new Error(`The Vercel function exited with code ${code}: ${output}`)))
  })
  return {
    url: `http://localhost:${port}`,
    output: () => output,
    stop: () => fn.kill(),
  }
}
