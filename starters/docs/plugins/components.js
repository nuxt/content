import Vue from 'vue'

/*
** Import all components from `base/` and `icon/` directories
** Learn more on require.context() on https://webpack.js.org/guides/dependency-management/#requirecontext
*/
function importComponents (prefix, r) {
  r.keys().forEach((filename) => {
    let Component = r(filename)

    Component = Component.default || Component
    Component.name = Component.name || (prefix + filename.replace(/^.+\//, '').replace(/\.\w+$/, ''))
    Vue.component(Component.name, Component)
  })
}

importComponents('Base', require.context('@/components/base', true, /\.(vue|js)$/))
importComponents('Icon', require.context('@/components/icon', true, /\.(vue|js)$/))
