import type { ContentTransformer } from '../../../types/content'

export const defineTransformer = (transformer: ContentTransformer) => {
  return transformer
}

export const formatDateTime = (datetime: string): string => {
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(datetime)) {
    return datetime
  }
  const normalized = datetime.replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})(\.\d+)?$/, '$1T$2$3Z')
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) {
    throw new TypeError(`Invalid datetime value: "${datetime}"`)
  }

  const year = d.getUTCFullYear()
  const month = d.getUTCMonth() + 1
  const day = d.getUTCDate()
  const hours = d.getUTCHours()
  const minutes = d.getUTCMinutes()
  const seconds = d.getUTCSeconds()

  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const formatDate = (date: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }
  const normalized = date.replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})(\.\d+)?$/, '$1T$2$3Z')
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) {
    throw new TypeError(`Invalid date value: "${date}"`)
  }

  const year = d.getUTCFullYear()
  const month = d.getUTCMonth() + 1
  const day = d.getUTCDate()

  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}
