import { z as zod } from 'zod'

declare module 'zod' {
  interface ZodTypeDef {
    editor?: EditorOptions
  }

  interface ZodType {
    editor(options: EditorOptions): this
  }
}

interface EditorOptions {
  input?: 'media' | 'icon' // Override the default input for the field
  hidden?: boolean // Do not display the field in the editor
}

export function enhanceZodWithEditor() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (zod.ZodType as any).prototype.editor = function (options: EditorOptions) {
    this._def.editor = { ...this._def.editor, ...options }
    return this
  }
}
