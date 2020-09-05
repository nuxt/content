const path = require('path')
const sao = require('sao')

const generator = path.join(__dirname, '../src')

describe('create-nuxt-content', () => {
  test('should write files with good answers (GitHub)', async () => {
    const answers = {
      name: 'nuxt-content-docs',
      title: 'Nuxt Content',
      url: 'https://content.nuxtjs.org',
      github: 'nuxt/content',
      twitter: 'nuxt_js'
    }
    const stream = await sao.mock({ generator }, answers)

    const pkg = await stream.readFile('package.json')

    expect(JSON.parse(pkg)).toEqual(expect.objectContaining({
      name: 'nuxt-content-docs',
      version: '1.0.0',
      private: true
    }))
  })

  test('should write files with good answers (GitHub Enterprise)', async () => {
    const answers = {
      name: 'nuxt-content-docs',
      title: 'Nuxt Content',
      url: 'https://content.nuxtjs.org',
      github: 'https://api.ghe.com/repos/me/project',
      twitter: 'nuxt_js'
    }
    const stream = await sao.mock({ generator }, answers)

    const pkg = await stream.readFile('package.json')

    expect(JSON.parse(pkg)).toEqual(expect.objectContaining({
      name: 'nuxt-content-docs',
      version: '1.0.0',
      private: true
    }))
  })
})
