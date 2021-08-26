/**
 * Based on https://github.com/micromark/micromark-extension-component
 **/

import tokenizeSpan from './tokenize-span'
import tokenizeAttribute from './tokenize-attribute'
import tokenizeInline from './tokenize-inline'
import tokenizeContainer from './tokenize-container'
import tokenizeContainerIndented from './tokenize-container-indented'
import { Codes } from './constants'

export default function micromarkComponentsExtension() {
  return {
    text: {
      [Codes.colon]: tokenizeInline,
      [Codes.openingSquareBracket]: [tokenizeSpan],
      [Codes.openingCurlyBracket]: tokenizeAttribute
    },
    flow: {
      [Codes.colon]: [tokenizeContainer, tokenizeInline]
    },
    flowInitial: {
      '-2': tokenizeContainerIndented,
      '-1': tokenizeContainerIndented,
      [Codes.space]: tokenizeContainerIndented
    }
  }
}
