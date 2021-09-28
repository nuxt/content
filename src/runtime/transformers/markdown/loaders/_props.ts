import fs from 'fs'
import { resolve, join } from 'pathe'
import { parse } from 'vue-docgen-api'
import { setNodeData } from '@docus/mdc/utils'

interface PropsComponentHandlerOptions {
  paths?: string[]
}

const fileName = (file: string) => (file.match(/\.vue$/) ? file : file + '.vue')

function resolvePath(file: string, { paths = [] }: PropsComponentHandlerOptions = {}) {
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

export default function propsComponentHandler(options: PropsComponentHandlerOptions) {
  return async function propsHandler(node: any, pageData: any) {
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
