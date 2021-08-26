import { pascalCase } from 'scule'
import Vue from 'vue'
import { ComputedRef } from '@nuxtjs/composition-api'
import type { DocusDocument } from '@docus/core'

// TODO: remove this logic and move its to navgation generator
export const useDocusTemplates = ({ api, state }: any, currentNav: ComputedRef<any>) => {
  function getPageTemplate(page: DocusDocument) {
    let template =
      /**
       * Use template defined in page data
       */
      typeof page.template === 'string' ? page.template : page.template?.self

    /**
     * Look for template in parent pages
     */
    if (!template) {
      // Fetch from nav (root to link) and fallback to settings.template
      const slugs: string[] = page.to.split('/').filter(Boolean).slice(0, -1) // no need to get latest slug since it is current page

      let { links } = currentNav?.value || {}

      slugs.forEach((_slug: string, index: number) => {
        // generate full path of parent
        const to = '/' + slugs.slice(0, index + 1).join('/')
        const link = api.findLink(links, to)

        if (link?.template) {
          template = link.template || template
        }

        if (!link?.children) return

        links = link.children
      })
    }

    /**
     * Use global template if template is not defined in page data or in parent pages
     */
    if (!template) {
      template = state.settings.template
    }

    template = pascalCase(template)

    if (!Vue.component(template)) {
      // eslint-disable-next-line no-console
      console.error(`Template ${template} does not exists, fallback to Page template.`)

      template = 'Page'
    }

    return template
  }

  return {
    getPageTemplate
  }
}
