import path from 'path'
import fs from 'fs'
import { parse } from 'vue-docgen-api'
import { setNodeData } from '../utils'

const directories = [
  path.resolve('./docs/components'), // components directory of project docs
  path.resolve('./components'), // components directory of project docs
  path.resolve(__dirname, '../../../../defaultTheme') // components directory of Docus
]

function fileName(file) {
  if (!file.match(/\.vue$/)) {
    return file + '.vue'
  }
  return file
}

function resolvePath(file: string) {
  file = fileName(file)
  if (fs.existsSync(path.resolve(file))) {
    return path.resolve(file)
  }
  for (const dir of directories) {
    if (fs.existsSync(path.join(dir, file))) {
      return path.join(dir, file)
    }
  }
  return null
}

export default async function propsHandler(node: any, pageData: any) {
  const componentFile = resolvePath(node.attributes.of)
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
