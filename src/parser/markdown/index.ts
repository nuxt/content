import { camelCase } from 'scule'
import { tryRequire, logger } from '../../utils'

const processPlugins = (type: string, markdown: any) => {
  const plugins = []

  for (const plugin of markdown[`${type}Plugins`]) {
    let name
    let options
    let instance

    if (typeof plugin === 'string') {
      name = plugin
      options = markdown[camelCase(name)]
    } else if (Array.isArray(plugin)) {
      ;[name, options] = plugin
    } else if (typeof plugin === 'object') {
      instance = plugin.instance
      name = plugin.name
      options = plugin.key ? markdown[plugin.key] : plugin.options
    }

    try {
      instance = instance || tryRequire(name)

      plugins.push({ instance, name, options })
    } catch (e) {
      logger.error(e.toString())
    }
  }

  return plugins
}

export const processContext = ({ transformers: { markdown: options } }) => {
  options.remarkPlugins = processPlugins('remark', options)
  options.rehypePlugins = processPlugins('rehype', options)
}
