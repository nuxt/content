import type { Effects, State, Code, TokenizeContext } from 'micromark-util-types'
import { Codes } from './constants'

function attempClose (this: TokenizeContext, effects: Effects, ok: State, nok: State) {
  return start

  function start (code: Code) {
    if (code !== Codes.closingCurlyBracket) {
      return nok(code)
    }
    effects.exit('bindingContent')
    effects.enter('bindingFence')
    effects.consume(code)
    return secondBracket
  }

  function secondBracket (code: Code) {
    if (code !== Codes.closingCurlyBracket) {
      return nok(code)
    }
    effects.consume(code)
    effects.exit('bindingFence')

    return ok
  }
}

function tokenize (this: TokenizeContext, effects: Effects, ok: State, nok: State) {
  return start

  function start (code: Code): void | State {
    if (code !== Codes.openingCurlyBracket) {
      throw new Error('expected `{`')
    }

    effects.enter('bindingFence')
    effects.consume(code)
    return secondBracket
  }

  function secondBracket (code: Code): void | State {
    if (code !== Codes.openingCurlyBracket) {
      return nok(code)
    }
    effects.consume(code)
    effects.exit('bindingFence')
    effects.enter('bindingContent')

    return content
  }

  function content (code: Code): void | State {
    if (code === Codes.closingCurlyBracket) {
      return effects.attempt({ tokenize: attempClose, partial: true }, close, (code) => {
        effects.consume(code)
        return content
      })(code)
    }

    effects.consume(code)
    return content
  }

  function close (code: Code): void | State {
    return ok(code)
  }
}

export default {
  tokenize
}
