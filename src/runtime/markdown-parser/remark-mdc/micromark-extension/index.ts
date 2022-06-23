/**
 * Based on: https://github.com/micromark/micromark-extension-directive
 * Version: 2.1.0
 * License: MIT (https://github.com/micromark/micromark-extension-directive/blob/main/license)
 **/

import tokenizeSpan from './tokenize-span'
import tokenizeAttribute from './tokenize-attribute'
import tokenizeBinding from './tokenize-binding'
import tokenizeInline from './tokenize-inline'
import tokenizeContainer from './tokenize-container'
import tokenizeContainerIndented from './tokenize-container-indented'
import { Codes } from './constants'

export default function micromarkComponentsExtension () {
  return {
    text: {
      [Codes.colon]: tokenizeInline,
      [Codes.openingSquareBracket]: [tokenizeSpan],
      [Codes.openingCurlyBracket]: [tokenizeBinding, tokenizeAttribute]
    },
    flow: {
      [Codes.colon]: [tokenizeContainer]
    },
    flowInitial: {
      '-2': tokenizeContainerIndented,
      '-1': tokenizeContainerIndented,
      [Codes.space]: tokenizeContainerIndented
    }
  }
}
