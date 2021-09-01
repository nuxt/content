// @ts-nocheck
<% 
const remarkPlugins = options.context.transformers.markdown.remarkPlugins
const rehypePlugins = options.context.transformers.markdown.rehypePlugins
const components = options.context.transformers.markdown.components.filter(item => !item.target || item.target === options.target)
%>
<% components.forEach(item => { %>
import component_<%= item.name %> from '<%= item.path %>'
<% }) %>
<% remarkPlugins.forEach(item => { %>
import remark_<%= item[0] || item.name || item %> from '<%= item[0] || item.name || item %>'
<% }) %>
<% rehypePlugins.forEach(item => { %>
  import rehype_<%= item[0] || item.name || item %> from '<%= item[0] || item.name || item %>'
  <% }) %>

const _context = <%= JSON.stringify(options.context) %>

_context.transformers.markdown.components = [
  <% components.forEach(item => { %>{
    name: '<%= item.name %>',
    instance: component_<%= item.name %>,
    options: <%= JSON.stringify(item.options || {}) %>
  }, <% }) %>
]

_context.transformers.markdown.remarkPlugins = [
  <% remarkPlugins.forEach(item => { %>{
    name: '<%= item[0] || item.name || item  %>',
    instance: component_<%= item[0] || item.name || item %>,
    options: <%= JSON.stringify(item[1] || item.options || {}) %>
  }, <% }) %>
]

_context.transformers.markdown.rehypePlugins = [
  <% rehypePlugins.forEach(item => { %>{
    name: '<%= item[0] || item.name || item  %>',
    instance: component_<%= item[0] || item.name || item %>,
    options: <%= JSON.stringify(item[1] || item.options || {}) %>
  }, <% }) %>
]

export const context = _context
export default _context
