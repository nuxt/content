import { z as zod } from 'zod'
import type { EditorOptions } from '../../types'

declare module 'zod' {
  interface ZodTypeDef {
    editor?: EditorOptions
  }

  interface ZodType {
    editor(options: EditorOptions): this
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(zod.ZodType as any).prototype.editor = function (options: EditorOptions) {
  this._def.editor = { ...this._def.editor, ...options }
  return this
}

export const z = zod
