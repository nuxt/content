export function measurePerformance() {
  const times = [
    { name: 'start', time: performance.now() },
  ]

  return {
    tick(name: string) {
      times.push({ name, time: performance.now() })
    },
    end(jobName: string) {
      const timesString = times.reduce((acc, time, index) => {
        if (index > 0) {
          acc.push(`-- ${time.name}: ${(time.time - times[index - 1].time).toPrecision(4)}ms\n`)
        }
        return acc
      }, [] as string[])

      return `${jobName}: ${(times[times.length - 1].time - times[0].time).toPrecision(4)}ms\n${timesString.join('')}`
    },
  }
}
