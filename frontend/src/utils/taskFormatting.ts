export function parseApiDate(value: string): Date {
  const normalized = value.trim()

  if (
    normalized.endsWith('Z') ||
    /[+-]\d{2}:\d{2}$/.test(normalized)
  ) {
    return new Date(normalized)
  }

  // API stores UTC but may serialize without a timezone suffix.
  return new Date(`${normalized}Z`)
}

export function formatDate(value: string) {
  const date = parseApiDate(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
