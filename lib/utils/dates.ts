import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { toZonedTime } from 'date-fns-tz'

export const UY_TIMEZONE = 'America/Montevideo'

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(toZonedTime(d, UY_TIMEZONE), pattern, { locale: es })
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return isBefore(parseISO(dueDate), new Date())
}

export function isDueSoon(dueDate: string | null, daysAhead = 7): boolean {
  if (!dueDate) return false
  const due = parseISO(dueDate)
  const soon = new Date()
  soon.setDate(soon.getDate() + daysAhead)
  return isAfter(due, new Date()) && isBefore(due, soon)
}

export function nowInUY(): Date {
  return toZonedTime(new Date(), UY_TIMEZONE)
}
