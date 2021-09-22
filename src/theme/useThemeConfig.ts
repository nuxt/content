import { createContext } from 'unctx'

const ctx = createContext()

export const setThemeConfig = ctx.set
export const useThemeConfig = ctx.use
