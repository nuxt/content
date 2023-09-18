export function* chunksFromArray<T> (arr: T[], n: number) : Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n)
  }
}
