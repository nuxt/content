import Vue from 'vue'

export default function ({ app }) {
  Vue.prototype.localeTo = (to) => {
    return app.localePath(to).replace(/index$/, '')
  }
}
