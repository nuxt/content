import { defineHandle, useQuery } from 'h3'
import { prefixStorage } from 'unstorage'
import { faker } from '@faker-js/faker'
import { storage } from '#storage'

const contentStorage = prefixStorage(storage, 'content:source')

export default defineHandle(async (req) => {
  const { count = 100 } = useQuery(req)

  const fakeContents = await contentStorage.getKeys('content:fake')

  await Promise.all(fakeContents.map(key => contentStorage.removeItem(key)))

  for (let i = 0; i < +count; i++) {
    const { name, content } = generateMD()
    await contentStorage.setItem(`content:fake:${name}.md`, content)
  }
})

function generateMD () {
  const name = faker.lorem.word() + '-' + faker.lorem.word()
  const content = `---
title: "${faker.lorem.words()}"
layout: Page
---
> ${faker.lorem.sentence()}

${faker.lorem.sentence()}

# ${faker.lorem.sentence()}

- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
`

  return {
    name,
    content
  }
}
