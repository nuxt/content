export default function mockAdapter(_opts: unknown) {
  return {
    prepare: (_sql: string) => ({
      all: (..._params: unknown[]) => Promise.resolve([]),
      get: (..._params: unknown[]) => Promise.resolve(null),
      run: (..._params: unknown[]) => Promise.resolve(undefined),
    }),
  }
}
