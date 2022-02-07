import pluginMD from '../../src/runtime/server/transformer/plugin-markdown'
import pluginYaml from '../../src/runtime/server/transformer/plugin-yaml'
import pluginMeta from '../../src/runtime/server/transformer/plugin-path-meta'

export const plugins = [pluginMD, pluginYaml, pluginMeta]
export const getParser = (ext: string) => plugins.find(p => p.extentions.includes(ext) && p.parse)
export const getTransformers = (ext: string) =>
  plugins.filter(p => ext.match(new RegExp(p.extentions.join('|'))) && p.transform)
export default () => {}
