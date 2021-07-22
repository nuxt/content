import fs from 'fs'
import path from 'upath'
import { parse } from 'vue-docgen-api'
import { useDocusContext } from '../../../context'
import { setNodeData } from '../utils'

const fileName = (file: string) => (file.match(/\.vue$/) ? file : file + '.vue')

function resolvePath(file: string) {
  const {
    dir: { components }
  } = useDocusContext()!

  file = fileName(file)
  if (fs.existsSync(path.resolve(file))) {
    return path.resolve(file)
  }
  for (const dir of components) {
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
