import Vue from 'vue'

/*
** Import all components from `base/` and `icon/` directories
** Learn more on require.context() on https://webpack.js.org/guides/dependency-management/#requirecontext
*/
function importComponents (r) {
  r.keys().forEach((filename) => {
    let Component = r(filename)

    Component = Component.default || Component
    Component.name = Component.name || filename.replace(/^.+\//, '').replace(/\.\w+$/, '')
    Vue.component(Component.name, Component)
  })
}

importComponents(require.context('@/components/bases', true, /\.(vue|js)$/))
importComponents(require.context('@/components/icons', true, /\.(vue|js)$/))
