export async function fetchGithub (url) {
  const options = {}

  if (process.env.GITHUB_TOKEN) {
    options.headers = { Authorization: `token ${process.env.GITHUB_TOKEN}` }
  }

  try {
    const data = await fetch(url, options).then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText)
      }
      return res
    }).then(res => res.json())

    return data
  } catch (e) { }
}

const getMajorVersion = r => r.name && Number(r.name.substring(1, 2))

export function sortByVersion (a, b) {
  const aMajorVersion = getMajorVersion(a)
  const bMajorVersion = getMajorVersion(b)

  if (aMajorVersion !== bMajorVersion) {
    return bMajorVersion - aMajorVersion
  }

  if (b.date && a.date) {
    return new Date(b.date) - new Date(a.date)
  }

  return 0
}
