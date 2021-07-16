import { Effects, Okay, NotOkay } from 'micromark/dist/shared-types'
// @ts-ignore
import createSpace from 'micromark/dist/tokenize/factory-space'
// @ts-ignore
import codeFenced from 'micromark/dist/tokenize/code-fenced.js'
// @ts-ignore
import prefixSize from 'micromark/dist/util/prefix-size'
import componentContainer from './tokenize-container'
import { Codes } from './constants'

function tokenize(effects: Effects, ok: Okay, nok: NotOkay) {
  const self = this
  return createSpace(effects, lineStart, 'linePrefix')

  function lineStart(code) {
    // skip if line prefix is smaller than markdown code indent
    if (prefixSize(self.events, 'linePrefix') < 4) {
      return nok(code)
    }
    switch (code) {
      case Codes.backTick:
        return codeFenced.tokenize.call(self, effects, ok, nok)(code)
      case Codes.colon:
        return componentContainer.tokenize.call(self, effects, ok, nok)(code)
      default:
        return nok(code)
    }
  }
}

export default {
  tokenize
}
