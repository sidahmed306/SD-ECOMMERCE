import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDate(date) {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr })
}

export function formatDateShort(date) {
  return format(new Date(date), 'dd MMM', { locale: fr })
}

export function formatMoney(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 MRO'
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  return `${formatted} MRO`
}

export function formatPercent(value) {
  return `${value}%`
}

export function getPeriodStart(period) {
  const now = new Date()
  if (period === 'jour') return startOfDay(now)
  if (period === 'semaine') return startOfWeek(now, { weekStartsOn: 1 })
  if (period === 'mois') return startOfMonth(now)
  return null
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
