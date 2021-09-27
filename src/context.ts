import { getContext } from 'unctx'
import type { DocusConfig } from 'types'

const themeContext = getContext<any>('docus:theme')

export const setThemeConfig = themeContext.set
export const useThemeConfig = themeContext.use

const configContext = getContext<DocusConfig>('docus:config')

export const setDocusConfig = configContext.set
export const useDocusConfig = configContext.use
