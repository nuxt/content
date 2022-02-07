import type { Event } from 'benchmark'
import Benchmark from 'benchmark'
import { createContext } from 'unctx'

const suites: Array<Benchmark.Suite> = []
export function createSuite (name: string) {
  // eslint-disable-next-line import/no-named-as-default-member
  const suite = new Benchmark.Suite(name)
  const results: any[] = []
  suite.on('cycle', (event: Event) => {
    results.push({
      Benchmark: event.target.name,
      'ops/sec': Math.round(event.target.hz || 0).toLocaleString(),
      RME: `±${Math.round((event.target.stats?.rme || 0) * 100) / 100}%`,
      'Samples Count': event.target.stats?.sample.length || 0
    })
  })
  suite.on('complete', () => {
    /* eslint-disable */
    // @ts-ignore
    console.log('# ' + (suite.name || 'General Benchmarks'))
    console.table(results)
    /* eslint-enable */
  })

  suites.push(suite)

  return suite
}

export const defaultSuite = createSuite('')

const suiteContext = createContext()

export function benchmark (name: string, fn: () => any | Promise<any>, opts?: any) {
  const suite = suiteContext.use() || defaultSuite
  if (isAsyncFunction(fn)) {
    suite.add(name, (deferred: any) => (fn() as Promise<void>).then(() => deferred.resolve()), {
      defer: true,
      ...opts
    })
  } else {
    suite.add(name, fn, opts)
  }
}

export function describe (name: string, fn: () => void | Promise<void>) {
  const suite = createSuite(name)
  suiteContext.call(suite, () => {
    fn()
  })
}

export function afterAll (fn: () => void | Promise<void>) {
  defaultSuite.on('afterAll', fn)
}

export function beforeAll (fn: () => void | Promise<void>) {
  const suite = suiteContext.use() || defaultSuite
  suite.on('beforeAll', fn)
}

export function runSuite (suite: Benchmark.Suite) {
  // @ts-ignore
  const events: Record<string, Array<any>> = suite.events

  return new Promise((resolve) => {
    let beforeAll = Promise.resolve<any>([])
    suite.on('complete', () => {
      if (events.afterAll) {
        Promise.all(events.afterAll.map(fn => fn())).then(() => {
          suite.run()
        })
      }
      resolve(0)
    })

    if (events.beforeAll) {
      beforeAll = Promise.all(events.beforeAll.map(fn => fn()))
    }
    beforeAll.then(() => {
      suite.run()
    })
  })
}

export function runSuites () {
  return Promise.all(suites.map(runSuite))
}

function isAsyncFunction (c: any) {
  return ['async', 'AsyncFunction'].some(rk => String(c.constructor || c).includes(rk))
}
