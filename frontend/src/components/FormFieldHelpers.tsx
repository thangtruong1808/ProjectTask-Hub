interface FieldErrorProps {
  id: string
  message?: string
}

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null
  }

  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {message}
    </p>
  )
}

interface CharacterCountProps {
  id?: string
  current: number
  max: number
}

export function CharacterCount({ id, current, max }: CharacterCountProps) {
  const isOver = current > max
  const isNearLimit = current > max * 0.9

  return (
    <p
      id={id}
      className={`mt-1 text-right text-xs ${
        isOver
          ? 'font-medium text-red-600'
          : isNearLimit
            ? 'text-amber-600'
            : 'text-slate-400'
      }`}
      aria-live="polite"
    >
      {current}/{max}
    </p>
  )
}

export function fieldErrorClass(hasError: boolean) {
  return hasError
    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
}
