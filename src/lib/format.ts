export function formatValue(value: number | string, type: 'money' | 'percent' | 'number'): string {
  if (value === '' || value === null || value === undefined) return '—'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num) || num === 0) return '—'

  if (type === 'money') {
    if (num >= 1_000_000) return `R$${(num / 1_000_000).toFixed(1).replace('.', ',')}M`
    if (num >= 1_000) return `R$${(num / 1_000).toFixed(1).replace('.', ',')}k`
    return `R$ ${num.toFixed(0)}`
  }
  if (type === 'percent') {
    return `${(num * 100).toFixed(1)}%`
  }
  return num.toLocaleString('pt-BR')
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
