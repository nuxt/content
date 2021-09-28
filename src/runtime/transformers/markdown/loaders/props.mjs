import fs from 'fs'
import { join, resolve } from 'pathe'
import { parse } from 'vue-docgen-api'
import { setNodeData } from '@docus/mdc/utils'

const fileName = file => (file.match(/\.vue$/) ? file : file + '.vue')

function resolvePath(file, { paths = [] } = {}) {
  file = fileName(file)
  if (fs.existsSync(resolve(file))) {
    return resolve(file)
  }
  for (const dir of paths) {
    if (fs.existsSync(join(dir, file))) {
      return join(dir, file)
    }
  }
  return null
}

export default function propsComponentHandler(options) {
  return async function propsHandler(node, pageData) {
    const componentFile = resolvePath(node.attributes.of, options)
    if (!componentFile) {
      // eslint-disable-next-line no-console
      console.error('Component not find. ' + node.attributes.of)
      return {
        node: { type: 'html', value: '<!-- Invalid component -->' }
      }
    }

    const data = await parse(componentFile)
    setNodeData(node, 'data', data, pageData)
  }
}
