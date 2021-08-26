import { createContext } from 'unctx'

const ctx = createContext()

export const setDocusSettings = ctx.set
export const useDocusSettings = ctx.use
