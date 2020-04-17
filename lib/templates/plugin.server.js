import Vue from 'vue'
import NuxtContent from './nuxt-content'

Vue.component(NuxtContent.name, NuxtContent)

export default (ctx, inject) => {
  const $content = function() {
    const path = Array.from(arguments)
      .join('/')
      .replace(/\/+/g, '/')

    return ctx.ssrContext.database.query(`/${path}`)
  }

  inject('content', $content)
  ctx.$content = $content
}
