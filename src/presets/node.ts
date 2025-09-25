// src/presets/node.ts
import { definePreset } from '../utils/preset'
import { applyContentDumpsPreset } from './shared-dumps'

export default definePreset({
  name: 'node',
  async setupNitro(nitroConfig, ctx) {
    applyContentDumpsPreset(nitroConfig, { ...ctx, platform: 'node' })
  },
})
