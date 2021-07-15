import decode from 'parse-entities/decode-entity'

const own = {}.hasOwnProperty

export default function createDirectiveHtmlExtension(options) {
  const extensions = options || {}

  return {
    enter: {
      directiveContainer: enterContainer,
      directiveContainerAttributes: enterAttributes,
      directiveContainerContent: enterContainerContent,
      directiveContainerLabel: enterLabel,

      directiveLeaf: enterLeaf,
      directiveLeafAttributes: enterAttributes,
      directiveLeafLabel: enterLabel,

      directiveText: enterText,
      directiveTextAttributes: enterAttributes,
      directiveTextLabel: enterLabel
    },
    exit: {
      directiveContainer: exit,
      directiveContainerAttributeClassValue: exitAttributeClassValue,
      directiveContainerAttributeIdValue: exitAttributeIdValue,
      directiveContainerAttributeName: exitAttributeName,
      directiveContainerAttributeValue: exitAttributeValue,
      directiveContainerAttributes: exitAttributes,
      directiveContainerContent: exitContainerContent,
      directiveContainerFence: exitContainerFence,
      directiveContainerLabel: exitLabel,
      directiveContainerName: exitName,

      directiveLeaf: exit,
      directiveLeafAttributeClassValue: exitAttributeClassValue,
      directiveLeafAttributeIdValue: exitAttributeIdValue,
      directiveLeafAttributeName: exitAttributeName,
      directiveLeafAttributeValue: exitAttributeValue,
      directiveLeafAttributes: exitAttributes,
      directiveLeafLabel: exitLabel,
      directiveLeafName: exitName,

      directiveText: exit,
      directiveTextAttributeClassValue: exitAttributeClassValue,
      directiveTextAttributeIdValue: exitAttributeIdValue,
      directiveTextAttributeName: exitAttributeName,
      directiveTextAttributeValue: exitAttributeValue,
      directiveTextAttributes: exitAttributes,
      directiveTextLabel: exitLabel,
      directiveTextName: exitName
    }
  }

  function enterContainer() {
    return enter.call(this, 'containerDirective')
  }

  function enterLeaf() {
    return enter.call(this, 'leafDirective')
  }

  function enterText() {
    return enter.call(this, 'textDirective')
  }

  function enter(type) {
    let stack = this.getData('directiveStack')
    if (!stack) this.setData('directiveStack', (stack = []))
    stack.push({ type })
  }

  function exitName(token) {
    const stack = this.getData('directiveStack')
    stack[stack.length - 1].name = this.sliceSerialize(token)
  }

  function enterLabel() {
    this.buffer()
  }

  function exitLabel() {
    const data = this.resume()
    const stack = this.getData('directiveStack')
    stack[stack.length - 1].label = data
  }

  function enterAttributes() {
    this.buffer()
    this.setData('directiveAttributes', [])
  }

  function exitAttributeIdValue(token) {
    this.getData('directiveAttributes').push(['id', decodeLight(this.sliceSerialize(token))])
  }

  function exitAttributeClassValue(token) {
    this.getData('directiveAttributes').push(['class', decodeLight(this.sliceSerialize(token))])
  }

  function exitAttributeName(token) {
    // Attribute names in CommonMark are significantly limited, so character
    // references can’t exist.
    this.getData('directiveAttributes').push([this.sliceSerialize(token), ''])
  }

  function exitAttributeValue(token) {
    const attributes = this.getData('directiveAttributes')
    attributes[attributes.length - 1][1] = decodeLight(this.sliceSerialize(token))
  }

  function exitAttributes() {
    const stack = this.getData('directiveStack')
    const attributes = this.getData('directiveAttributes')
    const cleaned: any = {}
    let index = -1
    let attribute

    while (++index < attributes.length) {
      attribute = attributes[index]

      if (attribute[0] === 'class' && cleaned.class) {
        cleaned.class += ' ' + attribute[1]
      } else {
        cleaned[attribute[0]] = attribute[1]
      }
    }

    this.resume()
    this.setData('directiveAttributes')
    stack[stack.length - 1].attributes = cleaned
  }

  function enterContainerContent() {
    this.buffer()
  }

  function exitContainerContent() {
    const data = this.resume()
    const stack = this.getData('directiveStack')
    stack[stack.length - 1].content = data
  }

  function exitContainerFence() {
    const stack = this.getData('directiveStack')
    const directive = stack[stack.length - 1]
    if (!directive.fenceCount) directive.fenceCount = 0
    directive.fenceCount++
    if (directive.fenceCount === 1) this.setData('slurpOneLineEnding', true)
  }

  function exit() {
    const directive = this.getData('directiveStack').pop()
    let found
    let result

    if (own.call(extensions, directive.name)) {
      result = extensions[directive.name].call(this, directive)
      found = result !== false
    }

    if (!found && own.call(extensions, '*')) {
      result = extensions['*'].call(this, directive)
      found = result !== false
    }

    if (!found && directive.type !== 'textDirective') {
      this.setData('slurpOneLineEnding', true)
    }
  }
}

function decodeLight(value) {
  return value.replace(/&(#(\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi, decodeIfPossible)
}

function decodeIfPossible($0, $1) {
  return decode($1) || $0
}
