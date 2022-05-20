import type { Effects, State, TokenizeContext, Code } from 'micromark-util-types'
import { codeFenced } from 'micromark-core-commonmark'
import { factorySpace } from 'micromark-factory-space'
import { prefixSize } from './utils'
import componentContainer from './tokenize-container'
import { Codes } from './constants'

function tokenize (this: TokenizeContext, effects: Effects, ok: State, nok: State) {
  const self = this
  return factorySpace(effects, lineStart as State, 'linePrefix')

  function lineStart (code: Code): void | State {
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
