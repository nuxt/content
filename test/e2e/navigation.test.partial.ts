import { $fetch } from 'ohmyfetch/node'
import { expect } from 'chai'
import { url } from '@nuxt/test-utils'

export default function navigationTest() {
  it('Global Navigation', async () => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const nav = await $fetch(url('/api/_docus/navigation'))
    expect(nav).to.has.ownProperty('fa')
    expect(nav).to.has.ownProperty('en')

    expect(nav.fa.map((i: any) => i.slug)).to.has.members(['', 'nav-dir1', 'nav-dir2'])
  })

  // it('Watch File Change', async () => {
  //   const path = join(__dirname, '../contents/navigation/fa/index.md')
  //   const originalContent = await fs.readFile(path, { encoding: 'utf-8' })

  //   const newContent = originalContent.replace('title: Home', 'title: Modified Title')
  //   await fs.writeFile(path, newContent, { encoding: 'utf-8' })

  //   // wait core to watch file change
  //   await new Promise(resolve => setTimeout(resolve, 1800))

  //   const nav = await $fetch(url('/api/_docus/navigation'))

  //   // revent file content
  //   await fs.writeFile(path, originalContent, { encoding: 'utf-8' })

  //   expect(nav.fa[0].title).to.equal('Modified Title')
  // })
}
