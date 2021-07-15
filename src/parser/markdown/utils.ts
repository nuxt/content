import hasha from 'hasha'

export function flattenNodeText(node) {
  if (node.type === 'text') {
    return node.value
  } else {
    return node.children.reduce((text, child) => {
      return text.concat(flattenNodeText(child))
    }, '')
  }
}

export function flattenNode(node, maxDepth = 2, _depth = 0) {
  if (!Array.isArray(node.children) || _depth === maxDepth) {
    return [node]
  }
  return [node, ...node.children.reduce((acc, child) => acc.concat(flattenNode(child, maxDepth, _depth + 1)), [])]
}

export function setNodeData(node, name, value, pageData) {
  if (!name.startsWith(':')) {
    name = ':' + name
  }
  const dataKey = `docus_d_${hasha(JSON.stringify(value)).substr(0, 8)}`
  pageData[dataKey] = value
  node.data.hProperties[name] = dataKey
}
