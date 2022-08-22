import { markdownLineEnding, markdownSpace } from 'micromark-util-character'
import { createTokenizer } from './create-tokenizer'

function initializeDocument (effects) {
  const delimiter = (this.parser.delimiter || ',').charCodeAt(0)

  return enterRow

  function enterRow (code) {
    return effects.attempt(
      { tokenize: attemptLastLine },
      (code) => {
        effects.consume(code)
        return enterRow
      },
      (code) => {
        effects.enter('row')
        return enterColumn(code)
      }
    )(code)
  }

  function enterColumn (code) {
    effects.enter('column')
    return content(code)
  }

  function content (code) {
    if (code === null) {
      effects.exit('column')
      effects.exit('row')
      effects.consume(code)
      return content
    }
    if (code === 34 /** " */) {
      return quotedData(code)
    }
    if (code === delimiter) {
      effects.exit('column')
      effects.enter('columnSeparator')
      effects.consume(code)
      effects.exit('columnSeparator')
      effects.enter('column')
      return content
    }
    if (markdownLineEnding(code)) {
      effects.exit('column')
      effects.enter('newline')
      effects.consume(code)
      effects.exit('newline')
      effects.exit('row')

      return enterRow
    }
    return data(code)
  }

  // data
  function data (code) {
    effects.enter('data')
    return dataChunk(code)
  }

  function dataChunk (code) {
    if (code === null || markdownLineEnding(code) || code === delimiter) {
      effects.exit('data')
      return content(code)
    }
    if (code === 92 /** \ */) {
      return escapeCharacter(code)
    }
    effects.consume(code)
    return dataChunk
  }

  function escapeCharacter (code) {
    effects.consume(code)
    return function (code) {
      effects.consume(code)
      return content
    }
  }

  function quotedData (code) {
    effects.enter('quotedData')
    effects.enter('quotedDataChunk')
    effects.consume(code)

    return quotedDataChunk
  }

  function quotedDataChunk (code) {
    if (code === 92 /** \ */) {
      return escapeCharacter(code)
    }
    if (code === 34) {
      return effects.attempt(
        { tokenize: attemptDoubleQuote },
        (code) => {
          effects.exit('quotedDataChunk')
          effects.enter('quotedDataChunk')
          return quotedDataChunk(code)
        },
        (code) => {
          effects.consume(code)
          effects.exit('quotedDataChunk')
          effects.exit('quotedData')

          return content
        }
      )(code)
    }
    effects.consume(code)
    return quotedDataChunk
  }
}

function attemptDoubleQuote (effects, ok, nok) {
  return startSequence

  function startSequence (code) {
    if (code !== 34) {
      return nok(code)
    }
    effects.enter('quoteFence')
    effects.consume(code)
    return sequence
  }

  function sequence (code) {
    if (code !== 34) {
      return nok(code)
    }
    effects.consume(code)
    effects.exit('quoteFence')
    return code => ok(code)
  }
}

function attemptLastLine (effects, ok, nok) {
  return enterLine

  function enterLine (code) {
    if (!markdownSpace(code) && code !== null) {
      return nok(code)
    }
    effects.enter('emptyLine')
    return continueLine(code)
  }

  function continueLine (code) {
    if (markdownSpace(code)) {
      effects.consume(code)
      return continueLine
    }
    if (code === null) {
      effects.exit('emptyLine')
      return ok(code)
    }
    return nok(code)
  }
}

export const parse = (options) => {
  return createTokenizer(
    { ...options },
    { tokenize: initializeDocument },
    undefined
  )
}
