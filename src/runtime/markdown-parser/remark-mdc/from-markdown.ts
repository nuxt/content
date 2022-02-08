// @ts-nocheck
import type { Token } from 'micromark-util-types'
import { parseEntities } from 'parse-entities'
import { kebabCase } from 'scule'

const canContainEols = ['textComponent']
const enter = {
  componentContainer: enterContainer,
  componentContainerSection: enterContainerSection,
  componentContainerDataSection: enterContainerDataSection,
  componentContainerAttributes: enterAttributes,
  componentContainerLabel: enterContainerLabel,

  componentLeaf: enterLeaf,
  componentLeafAttributes: enterAttributes,

  componentText: enterText,
  textSpan: enterTextSpan,
  componentTextAttributes: enterAttributes
}
const exit = {
  componentContainerSectionTitle: exitContainerSectionTitle,
  listUnordered: conditionalExit,
  listOrdered: conditionalExit,
  listItem: conditionalExit,
  componentContainerSection: exitContainerSection,
  componentContainerDataSection: exitContainerDataSection,
  componentContainer: exitContainer,
  componentContainerAttributeClassValue: exitAttributeClassValue,
  componentContainerAttributeIdValue: exitAttributeIdValue,
  componentContainerAttributeName: exitAttributeName,
  componentContainerAttributeValue: exitAttributeValue,
  componentContainerAttributes: exitAttributes,
  componentContainerLabel: exitContainerLabel,
  componentContainerName: exitName,

  componentContainerAttributeInitializerMarker () {
    // If an attribute name follows by `=` it should be treat as string
    const attributes = this.getData('componentAttributes')
    attributes[attributes.length - 1][1] = ''
  },

  componentLeaf: exitToken,
  componentLeafAttributeClassValue: exitAttributeClassValue,
  componentLeafAttributeIdValue: exitAttributeIdValue,
  componentLeafAttributeName: exitAttributeName,
  componentLeafAttributeValue: exitAttributeValue,
  componentLeafAttributes: exitAttributes,
  componentLeafName: exitName,

  componentText: exitToken,
  textSpan: exitToken,
  componentTextAttributeClassValue: exitAttributeClassValue,
  componentTextAttributeIdValue: exitAttributeIdValue,
  componentTextAttributeName: exitAttributeName,
  componentTextAttributeValue: exitAttributeValue,
  componentTextAttributes: exitAttributes,
  componentTextName: exitName
}

function enterContainer (token: Token) {
  enterToken.call(this, 'containerComponent', token)
}

function exitContainer (token: Token) {
  const container = this.stack[this.stack.length - 1]
  if (container.children.length > 1) {
    const dataSection = container.children.find((child: any) => child.rawData)
    container.rawData = dataSection?.rawData
  }

  container.children = container.children.flatMap((child: any) => {
    if (child.rawData) {
      return []
    }
    if (child.name === 'default' || !child.name) {
      return child.children
    }
    child.data = {
      hName: 'component-slot',
      hProperties: {
        ...child.attributes,
        [`v-slot:${child.name}`]: ''
      }
    }
    return child
  })

  this.exit(token)
}

function enterContainerSection (token: Token) {
  enterToken.call(this, 'componentContainerSection', token)
}

function enterContainerDataSection (token: Token) {
  enterToken.call(this, 'componentContainerDataSection', token)
}

function exitContainerSection (token: Token) {
  this.exit(token)
}

function exitContainerDataSection (token: Token) {
  let section = this.stack[this.stack.length - 1]
  /**
   * Ensure lists and list-items are closed before closing section
   * This issue occurs because `---` separtors ar conflict with markdown lists
   */
  while (section.type === 'listItem' || section.type === 'list') {
    // As of mdast-util-from-markdown@1.1.0 tokenStach items is an array containing the token and a handler
    // https://github.com/syntax-tree/mdast-util-from-markdown/blob/752dc22acfc517d280612e8d499d5ce0cd5a4495/dev/lib/index.js#L548
    const [stackToken] = this.tokenStack[this.tokenStack.length - 1]
    this.exit(stackToken)
    section = this.stack[this.stack.length - 1]
  }

  if (section.type === 'componentContainerDataSection') {
    section.rawData = this.sliceSerialize(token)
    this.exit(token)
  }
}

function exitContainerSectionTitle (token: Token) {
  this.stack[this.stack.length - 1].name = this.sliceSerialize(token)
}

function enterLeaf (token: Token) {
  enterToken.call(this, 'leafComponent', token)
}

function enterTextSpan (token: Token) {
  this.enter({ type: 'textComponent', name: 'span', attributes: {}, children: [] }, token)
}

function enterText (token: Token) {
  enterToken.call(this, 'textComponent', token)
}

function enterToken (type: string, token: Token) {
  this.enter({ type, name: '', attributes: {}, children: [] }, token)
}

function exitName (token: Token) {
  this.stack[this.stack.length - 1].name = this.sliceSerialize(token)
}

function enterContainerLabel (token: Token) {
  this.enter({ type: 'paragraph', data: { componentLabel: true }, children: [] }, token)
}

function exitContainerLabel (token: Token) {
  this.exit(token)
}

function enterAttributes () {
  this.setData('componentAttributes', [])
  this.buffer() // Capture EOLs
}

function exitAttributeIdValue (token: Token) {
  this.getData('componentAttributes').push(['id', decodeLight(this.sliceSerialize(token))])
}

function exitAttributeClassValue (token: Token) {
  this.getData('componentAttributes').push(['class', decodeLight(this.sliceSerialize(token))])
}

function exitAttributeValue (token: Token) {
  const attributes = this.getData('componentAttributes')
  attributes[attributes.length - 1][1] = decodeLight(this.sliceSerialize(token))
}

function exitAttributeName (token: Token) {
  // Attribute names in CommonMark are significantly limited, so character
  // references can’t exist.

  // Use `true` as attribute default value to solve issue of attributes without value (example `:block{attr1 attr2}`)
  this.getData('componentAttributes').push([this.sliceSerialize(token), true])
}

function exitAttributes () {
  const attributes = this.getData('componentAttributes')
  const cleaned: Record<string, any> = {}
  let index = -1
  let attribute

  while (++index < attributes.length) {
    attribute = attributes[index]
    // Convert attribute names to kebab-case
    const name = kebabCase(attribute[0])

    if (name === 'class' && cleaned.class) {
      cleaned.class += ' ' + attribute[1]
    } else {
      cleaned[name] = attribute[1]
    }
  }

  this.setData('componentAttributes')
  this.resume() // Drop EOLs

  let stackTop = this.stack[this.stack.length - 1]
  if (stackTop.type === 'paragraph') {
    // select last inline component
    stackTop = stackTop.children[stackTop.children.length - 1]
  }

  stackTop.attributes = cleaned
}

function exitToken (token: Token) {
  this.exit(token)
}

function conditionalExit (token: Token) {
  // As of mdast-util-from-markdown@1.1.0 tokenStach items is an array containing the token and a handler
  // https://github.com/syntax-tree/mdast-util-from-markdown/blob/752dc22acfc517d280612e8d499d5ce0cd5a4495/dev/lib/index.js#L548
  const [section] = this.tokenStack[this.tokenStack.length - 1]
  if ((section as Token).type === token.type) {
    this.exit(token)
  }
}

function decodeLight (value: string) {
  return value.replace(/&(#(\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi, decodeIfPossible)
}

function decodeIfPossible ($0: string, _$1: string) {
  return parseEntities($0) || $0
}

export default {
  canContainEols,
  enter,
  exit
}
