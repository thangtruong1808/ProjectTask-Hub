export const TASK_NAME_MIN_LENGTH = 2
export const TASK_NAME_MAX_LENGTH = 200
export const TASK_DESCRIPTION_MAX_LENGTH = 2000

export interface TaskFormValues {
  name: string
  description: string
}

export interface TaskFormErrors {
  name?: string
  description?: string
}

export function validateTaskName(value: string): string | undefined {
  const name = value.trim()

  if (!name) {
    return 'Task name is required.'
  }

  if (name.length < TASK_NAME_MIN_LENGTH) {
    return `Task name must be at least ${TASK_NAME_MIN_LENGTH} characters.`
  }

  if (name.length > TASK_NAME_MAX_LENGTH) {
    return `Task name must not exceed ${TASK_NAME_MAX_LENGTH} characters.`
  }

  return undefined
}

export function validateTaskDescription(value: string): string | undefined {
  const description = value.trim()

  if (description.length > TASK_DESCRIPTION_MAX_LENGTH) {
    return `Description must not exceed ${TASK_DESCRIPTION_MAX_LENGTH} characters.`
  }

  return undefined
}

export function validateTaskForm(values: TaskFormValues): TaskFormErrors {
  const errors: TaskFormErrors = {}
  const nameError = validateTaskName(values.name)
  const descriptionError = validateTaskDescription(values.description)

  if (nameError) {
    errors.name = nameError
  }

  if (descriptionError) {
    errors.description = descriptionError
  }

  return errors
}

export function hasFormErrors(errors: TaskFormErrors): boolean {
  return Object.keys(errors).length > 0
}
