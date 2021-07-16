import { defineSirocConfig } from 'siroc'

export default defineSirocConfig({
  sortDependencies: true,
  rollup: {
    externals: ['fs/promises']
  }
})
