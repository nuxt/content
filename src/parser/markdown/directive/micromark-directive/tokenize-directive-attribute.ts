import { Effects, Okay, NotOkay } from 'micromark/dist/shared-types'
import markdownLineEnding from 'micromark/dist/character/markdown-line-ending'
import { Codes } from './constants'
import createAttributes from './factory-attributes'

const attributes: any = { tokenize: tokenizeAttributes, partial: true }

const validEvents = [
  /**
   * Span Directive
   */
  'directiveTextSpan',
  /**
   * Bold & Italic
   */
  'attentionSequence',
  /**
   * Inline Code
   */
  'codeText',
  /**
   * Link
   */
  'link',
  /**
   * Image
   */
  'image'
]

function tokenize(effects: Effects, ok: Okay, nok: NotOkay) {
  const self = this

  return start

  function start(code: number) {
    if (code !== Codes.openingCurlyBracket) throw new Error('expected `{`')

    /**
     * Make sure sytax is used after valid tags
     */
    const event = self.events[self.events.length - 1]
    if (markdownLineEnding(self.previous) || !validEvents.includes(event[1].type)) {
      return nok
    }

    return effects.attempt(attributes, ok, ok)(code)
  }
}

function tokenizeAttributes(effects: Effects, ok: Okay, nok: NotOkay) {
  // Always a `{`
  return createAttributes(
    effects,
    ok,
    nok,
    'directiveTextAttributes',
    'directiveTextAttributesMarker',
    'directiveTextAttribute',
    'directiveTextAttributeId',
    'directiveTextAttributeClass',
    'directiveTextAttributeName',
    'directiveTextAttributeInitializerMarker',
    'directiveTextAttributeValueLiteral',
    'directiveTextAttributeValue',
    'directiveTextAttributeValueMarker',
    'directiveTextAttributeValueData'
  )
}

export default {
  tokenize
}
