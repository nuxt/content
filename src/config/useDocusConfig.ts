import { createContext } from 'unctx'

const ctx = createContext()

export const setDocusConfig = ctx.set
export const useDocusConfig = ctx.use
