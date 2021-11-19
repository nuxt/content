import type { Documentation } from 'vue-docgen-api'
import type { ASTElement } from 'vue-template-compiler'
import type { Nuxt } from '@nuxt/kit'
import { installModule } from '@nuxt/kit'

export async function setupComponentMetaModule(nuxt: Nuxt) {
  /**
   * Custom template handler to detect `<Markdown>` components as slot for parent compoeneent
   * @param documentation
   * @param ast
   */
  const markdownTemplateHanlder = (documentation: Documentation, ast: ASTElement) => {
    if (ast.tag === 'Markdown') {
      const useValue = ast.props?.find(prop => prop.name === 'use')?.value as { content: string } | string | undefined
      const slotName = (typeof useValue === 'object' ? useValue.content : useValue) ?? 'default'
      documentation.getSlotDescriptor(slotName)
    }
  }

  await installModule(nuxt, {
    src: 'nuxt-component-meta/module',
    options: {
      parserOptions: {
        addTemplateHandlers: [markdownTemplateHanlder] as unknown[]
      }
    }
  })
}
