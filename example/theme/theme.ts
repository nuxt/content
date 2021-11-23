import { defineThemeConfig as _defineThemeConfig } from '../../src'

// Debug theme config interface
export interface BlankThemeConfig {
  [key: string]: any
}

// Debug theme config defaults
export const themeConfig: BlankThemeConfig = {
  showValues: true
}

// Debug theme config helper
export const defineThemeConfig = (config: BlankThemeConfig) => _defineThemeConfig<BlankThemeConfig>(config)
