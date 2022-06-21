import yaml from 'js-yaml'
import flat from 'flat'

const FRONTMATTER_DELIMITER = '---'

export function stringifyFrontMatter (data: any, content: string = '') {
  // flatten frontmatter data
  // convert `parent: { child: ... }` into flat keys `parent.child`
  data = flat.flatten(data, {
    // preserve arrays and their contents as is and do not waltk through arrays
    // flatten array will be like `parent.0.child` and `parent.1.child` with is not readable
    safe: true
  })

  if (!Object.keys(data).length) {
    return ''
  }

  return [
    FRONTMATTER_DELIMITER,
    yaml.dump(data, { lineWidth: -1 }).trim(),
    FRONTMATTER_DELIMITER,
    content
  ].join('\n')
}

export function parseFrontMatter (content: string) {
  let data = {}
  if (content.startsWith(FRONTMATTER_DELIMITER)) {
    const idx = content.indexOf('\n' + FRONTMATTER_DELIMITER)
    if (idx !== -1) {
      const frontmatter = content.slice(4, idx)
      if (frontmatter) {
        data = yaml.load(frontmatter)
        content = content.slice(idx + 4)
      }
    }
  }

  return {
    content,
    // unflatten frontmatter data. convert `parent.child` keys into `parent: { child: ... }`
    data: flat.unflatten(data || {}, {}) as Record<string, any>
  }
}
