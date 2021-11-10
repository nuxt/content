// @ts-nocheck
<% 
const remarkPlugins = options.transformers.markdown.remarkPlugins
const rehypePlugins = options.transformers.markdown.rehypePlugins
const components = options.transformers.markdown.components

const serializeImportName = id => '_' + id.replace(/[^a-zA-Z0-9_$]/g, '_')
%>
<% components.forEach(item => { %>
import <%= serializeImportName(item.name) %> from '<%= item.path %>'
<% }) %>
<% remarkPlugins.forEach(item => { %>
import <%= serializeImportName(item[0] || item.name || item) %> from '<%= item[0] || item.name || item %>'
<% }) %>
<% rehypePlugins.forEach(item => { %>
  import <%= serializeImportName(item[0] || item.name || item) %> from '<%= item[0] || item.name || item %>'
  <% }) %>

const _context = <%= JSON.stringify(options) %>

_context.transformers.markdown.components = [
  <% components.forEach(item => { %>{
    name: '<%= item.name %>',
    instance: <%= serializeImportName(item.name) %>,
    options: <%= JSON.stringify(item.options || {}) %>
  }, <% }) %>
]

_context.transformers.markdown.remarkPlugins = [
  <% remarkPlugins.forEach(item => { %>{
    name: '<%= item[0] || item.name || item  %>',
    instance: <%= serializeImportName(item[0] || item.name || item) %>,
    options: <%= JSON.stringify(item[1] || item.options || {}) %>
  }, <% }) %>
]

_context.transformers.markdown.rehypePlugins = [
  <% rehypePlugins.forEach(item => { %>{
    name: '<%= item[0] || item.name || item  %>',
    instance: <%= serializeImportName(item[0] || item.name || item) %>,
    options: <%= JSON.stringify(item[1] || item.options || {}) %>
  }, <% }) %>
]

export const context = _context
export default _context
