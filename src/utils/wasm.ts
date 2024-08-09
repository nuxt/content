import { useNitro } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { InputPluginOption } from 'rollup'

export function addWasmSupport(nuxt: Nuxt) {
  nuxt.hook('ready', () => {
    const nitro = useNitro()
    const _addWasmSupport = (_nitro: typeof nitro) => {
      if (nitro.options.experimental?.wasm) {
        return
      }
      _nitro.options.externals = _nitro.options.externals || {}
      _nitro.options.externals.inline = _nitro.options.externals.inline || []
      _nitro.options.externals.inline.push(id => id.endsWith('.wasm'))
      _nitro.hooks.hook('rollup:before', async (_, rollupConfig) => {
        const { rollup: unwasm } = await import('unwasm/plugin')
        rollupConfig.plugins = rollupConfig.plugins || [];
        (rollupConfig.plugins as InputPluginOption[]).push(
          unwasm({
            ..._nitro.options.wasm,
          }),
        )
      })
    }
    _addWasmSupport(nitro)
    nitro.hooks.hook('prerender:init', (prerenderer) => {
      _addWasmSupport(prerenderer)
    })
  })
}
