import type { ContentTransformer } from '../types'

export const defineTransformer = (transformer: ContentTransformer) => {
  return transformer
}

export const createSingleton = <T, Params extends Array<any>>(fn: (...arg: Params) => T) => {
  let instance: T | undefined
  return (...args: Params) => {
    if (!instance) {
      instance = fn(...args)
    }
    return instance
  }
}
