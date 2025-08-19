// src/presets/cloudflare.ts
import { definePreset } from '../utils/preset'
import { applyContentDumpsPreset } from './shared-dumps'

export default definePreset({
  name: 'cloudflare',
  async setupNitro(nitroConfig, ctx) {
    applyContentDumpsPreset(nitroConfig, { ...ctx, platform: 'cloudflare' })
  },
})
