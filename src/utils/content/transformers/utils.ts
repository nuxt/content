import { fromDate, toCalendarDateTime, toCalendarDate, getLocalTimeZone } from '@internationalized/date'
import type { ContentTransformer } from '../../../types/content'

export const defineTransformer = (transformer: ContentTransformer) => {
  return transformer
}

export const formatDateTime = (datetime: string): string => {
  const d = new Date(datetime)
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const seconds = d.getSeconds()

  return `${formatDate(datetime)} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const formatDate = (date: string): string => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()

  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}
