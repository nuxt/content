// @ts-nocheck
import { createDocus } from '#docus'

let _docusConfig = {}
<% if (options.hasDocusConfig) { %>
_docusConfig = require('~docus/cache/docus.config.json')
<% } %>

let _themeConfig = {}
<% if (options.hasTheme) { %>
_themeConfig = require('~docus/cache/theme.config.json')
<% } %>

/**
 * @type {import('@nuxt/types').Plugin}
 */
export default async function (ctx) {
  await createDocus(ctx, { docusConfig: _docusConfig, themeConfig: _themeConfig })
}
