import { describe, expect, test } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export const testMDCComponent = () => {
  describe('mdc-component', () => {
    test('normal/binded props', async () => {
      const content = await $fetch('/_partial/mdc-props')

      // Normal Prop
      expect(content).includes('<div class="prop-a">categories</div>')
      // Binded Prop
      expect(content).includes([
        '<div class="prop-b">[',
        '  &quot;Art&quot;,',
        '  &quot;History&quot;',
        ']</div>'
      ].join('\n'))
    })

    test('normal/binded props (inline component)', async () => {
      const content = await $fetch('/_partial/mdc-props-inline')

      // Normal Prop
      expect(content).includes('<div class="prop-a">categories</div>')
      // Binded Prop
      expect(content).includes([
        '<div class="prop-b">[',
        '  &quot;Art&quot;,',
        '  &quot;History&quot;',
        ']</div>'
      ].join('\n'))
    })
  })
}
