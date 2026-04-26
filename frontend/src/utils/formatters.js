import { format, parseISO } from 'date-fns'

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function formatDateTime(dateString) {
  if (!dateString) return '-'
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, 'MMM d, yyyy h:mm a')
  } catch {
    return dateString
  }
}

export function formatDate(dateString) {
  if (!dateString) return '-'
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, 'MMM d, yyyy')
  } catch {
    return dateString
  }
}

export function formatTime(dateString) {
  if (!dateString) return '-'
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, 'h:mm:ss a')
  } catch {
    return dateString
  }
}
