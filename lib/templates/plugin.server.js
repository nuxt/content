import Vue from 'vue'
import NuxtContent from '<%= options.watch && options.liveEdit ? `./nuxt-content.dev` : `./nuxt-content` %>'

Vue.component(NuxtContent.name, NuxtContent)

export default (ctx, inject) => {
  const $content = ctx.ssrContext.$content

  inject('content', $content)
  ctx.$content = $content
}
