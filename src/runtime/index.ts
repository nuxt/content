/**
 * Define custom plugin for Docus query layer
 */
export function defineQueryPlugin(plugin: QueryPlugin) {
  plugin.operators = plugin.operators || {}
  plugin.operators = Object.keys(plugin.operators).reduce((acc, key) => {
    acc[key.startsWith('$') ? key : `$${key}`] = plugin.operators![key]
    return acc
  }, {} as Record<string, QueryMatchOperator>)

  return plugin
}
