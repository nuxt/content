import encode from 'stringify-entities/light'
import visit from 'unist-util-visit-parents'
import flow from 'mdast-util-to-markdown/lib/util/container-flow'
import phrasing from 'mdast-util-to-markdown/lib/util/container-phrasing'
import checkQuote from 'mdast-util-to-markdown/lib/util/check-quote'

const own = {}.hasOwnProperty

const shortcut = /^[^\t\n\r "#'.<=>`}]+$/

// TODO: convert container sections to markdown
const unsafe = [
  {
    character: '\r',
    inConstruct: ['leafDirectiveLabel', 'containerDirectiveLabel']
  },
  {
    character: '\n',
    inConstruct: ['leafDirectiveLabel', 'containerDirectiveLabel']
  },
  {
    before: '[^:]',
    character: ':',
    after: '[A-Za-z]',
    inConstruct: ['phrasing']
  },
  { atBreak: true, character: ':', after: ':' }
]

const handlers = {
  containerDirective: handleDirective,
  leafDirective: handleDirective,
  textDirective: handleDirective
}

handleDirective.peek = peekDirective

function handleDirective(node, _, context) {
  const prefix = fence(node)
  const exit = context.enter(node.type)
  let value = prefix + (node.name || '') + label(node, context) + attributes(node, context)
  let subvalue

  if (node.type === 'containerDirective') {
    subvalue = content(node, context)
    if (subvalue) value += '\n' + subvalue
    value += '\n' + prefix
  }

  exit()
  return value
}

function peekDirective() {
  return ':'
}

function label(node, context) {
  let label = node

  if (node.type === 'containerDirective') {
    if (!inlineDirectiveLabel(node)) return ''
    label = node.children[0]
  }

  const exit = context.enter('label')
  const subexit = context.enter(node.type + 'Label')
  const value = phrasing(label, context, { before: '[', after: ']' })
  subexit()
  exit()
  return value ? '[' + value + ']' : ''
}

function attributes(node, context) {
  const quote = checkQuote(context)
  const subset = node.type === 'textDirective' ? [quote] : [quote, '\n', '\r']
  const attrs = node.attributes || {}
  const values = []
  let id
  let classesFull
  let classes
  let value
  let key
  let index

  for (key in attrs) {
    if (own.call(attrs, key) && attrs[key] != null) {
      value = String(attrs[key])

      if (key === 'id') {
        id = shortcut.test(value) ? '#' + value : quoted('id', value)
      } else if (key === 'class') {
        value = value.split(/[\t\n\r ]+/g)
        classesFull = []
        classes = []
        index = -1

        while (++index < value.length) {
          ;(shortcut.test(value[index]) ? classes : classesFull).push(value[index])
        }

        classesFull = classesFull.length ? quoted('class', classesFull.join(' ')) : ''
        classes = classes.length ? '.' + classes.join('.') : ''
      } else {
        values.push(quoted(key, value))
      }
    }
  }

  if (classesFull) {
    values.unshift(classesFull)
  }

  if (classes) {
    values.unshift(classes)
  }

  if (id) {
    values.unshift(id)
  }

  return values.length ? '{' + values.join(' ') + '}' : ''

  function quoted(key, value) {
    return key + (value ? '=' + quote + encode(value, { subset }) + quote : '')
  }
}

function content(node, context) {
  const content = inlineDirectiveLabel(node) ? Object.assign({}, node, { children: node.children.slice(1) }) : node

  return flow(content, context)
}

function inlineDirectiveLabel(node) {
  return node.children && node.children[0] && node.children[0].data && node.children[0].data.directiveLabel
}

function fence(node) {
  let size = 0

  if (node.type === 'containerDirective') {
    visit(node, 'containerDirective', onvisit)
    size += 3
  } else if (node.type === 'leafDirective') {
    size = 2
  } else {
    size = 1
  }

  return ':'.repeat(size)

  function onvisit(_node, parents) {
    let index = parents.length
    let nesting = 0

    while (index--) {
      if (parents[index].type === 'containerDirective') {
        nesting++
      }
    }

    if (nesting > size) size = nesting
  }
}

export default {
  handlers,
  unsafe
}
