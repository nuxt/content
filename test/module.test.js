const { setup, loadConfig, get } = require('@nuxtjs/module-test-utils')
const getPort = require('get-port')

describe('module', () => {
  let nuxt

  beforeAll(async () => {
    const port = await getPort()
    const config = {
      server: {
        port
      },
      ...loadConfig(__dirname, '../../example')
    };

    ({ nuxt } = (await setup(config, { port })))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('render', async () => {
    const html = await get('/')
    expect(html).toContain('Works!')
  })
})
