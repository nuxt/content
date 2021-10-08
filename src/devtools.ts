/* WIP Devtools integration

import { setupDevtoolsPlugin } from '@vue/devtools-api'

const inspectorId = 'docus.inspector'

export default ({ app }) => {
  if (process.client) {
    setupDevtoolsPlugin(
      {
        id: 'docus.devtools',
        label: 'Docus',
        packageName: 'docus',
        homepage: 'https://docus.dev',
        app,
        componentStateTypes: ['docus properties']
      },
      api => {
        api.addInspector({
          id: inspectorId,
          label: 'Docus',
          icon: 'history_edu',
          stateFilterPlaceholder: 'Filter state'
        })
      }
    )
  }
}
*/
