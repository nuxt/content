import { fromDate, toCalendarDateTime, toCalendarDate } from '@internationalized/date'
import type { ContentTransformer } from '../../../types/content'

export const defineTransformer = (transformer: ContentTransformer) => {
  return transformer
}

export const formatDateTime = (datetime: string): string => {
  return toCalendarDateTime(fromDate(new Date(datetime))).toString().replace('T', ' ')
}

export const formatDate = (date: string): string => {
  return toCalendarDate(fromDate(new Date(date))).toString()
}
