import { useEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from 'react'
import { useSelector } from 'react-redux'
import {
  assignTodo,
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  updateTodoStatus,
  type TaskItem,
  type TaskStatus,
} from '../api/todos'
import { getAssignableUsers } from '../api/users'
import { getProjects, getProjectAssignableUsers, type ProjectItem } from '../api/projects'
import type { UserDto } from '../api/client'
import type { RootState } from '../store'
import { usePageDocumentTitle } from './useDocumentTitle'
import {
  hasFormErrors,
  validateTaskForm,
  type TaskFormErrors,
} from '../utils/taskValidation'
import { compareTasks } from '../utils/taskSorting'
import {
  SUCCESS_DISMISS_MS,
  type ActionLoading,
  type DeleteTarget,
  type SortKey,
  type SortState,
} from '../components/tasks/taskConstants'

export function useTasksPage() {
  const user = useSelector((s: RootState) => s.auth.user)
  const tasksRefreshToken = useSelector((s: RootState) => s.notifications.tasksRefreshToken)
  const projectsRefreshToken = useSelector((s: RootState) => s.notifications.projectsRefreshToken)
  const isAdmin = user?.role === 'Admin'
  const isProjectManager = user?.role === 'ProjectManager'
  const canEditTaskDetails = isAdmin || isProjectManager
  const canCreateTask = isAdmin || isProjectManager
  const canDeleteTask = isAdmin || isProjectManager
  const canAssign = isAdmin || isProjectManager
  const canManageProjectTeam = isAdmin || isProjectManager

  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [projectFilter, setProjectFilter] = useState<number | ''>('')
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [newTaskProjectId, setNewTaskProjectId] = useState<number | ''>('')
  const [assignableUsers, setAssignableUsers] = useState<UserDto[]>([])
  const [projectAssignableUsers, setProjectAssignableUsers] = useState<Record<number, UserDto[]>>({})
  const [assignableLoadingByProject, setAssignableLoadingByProject] = useState<Record<number, boolean>>({})
  const assignableLoadStarted = useRef(new Set<number>())
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus | ''>('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formErrors, setFormErrors] = useState<TaskFormErrors>({})
  const [actionLoading, setActionLoading] = useState<ActionLoading>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [sortState, setSortState] = useState<SortState>({
    key: 'updatedAt',
    direction: 'desc',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const taskFormRef = useRef<HTMLFormElement>(null)
  const taskQueryRef = useRef({
    searchQuery: '',
    statusFilter: '' as TaskStatus | '',
    projectFilter: '' as number | '',
  })

  usePageDocumentTitle('tasks', loading && tasks.length === 0)

  taskQueryRef.current = { searchQuery, statusFilter, projectFilter }

  const isEditing = editingId !== null
  const isNameDescriptionReadOnly = isEditing && !canEditTaskDetails
  const isCreating = actionLoading?.type === 'create'
  const isSavingEdit =
    actionLoading?.type === 'edit' && editingId !== null
  const isFormSubmitting = isCreating || isSavingEdit
  const isDeleting =
    actionLoading?.type === 'delete' &&
    deleteTarget !== null &&
    actionLoading.id === deleteTarget.id
  const isSearchDebouncing = searchInput.trim() !== searchQuery
  const isFilterLoading = loading && tasks.length > 0
  const hasActiveFilters = Boolean(searchQuery || statusFilter || projectFilter)

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => compareTasks(a, b, sortState))
  }, [tasks, sortState])

  const totalPages = Math.max(1, Math.ceil(sortedTasks.length / pageSize))

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedTasks.slice(start, start + pageSize)
  }, [sortedTasks, currentPage, pageSize])

  const selectedProject = useMemo(
    () => (projectFilter === '' ? null : projects.find((p) => p.id === projectFilter) ?? null),
    [projectFilter, projects],
  )

  const editingTask = useMemo(
    () => (editingId === null ? null : tasks.find((task) => task.id === editingId) ?? null),
    [editingId, tasks],
  )

  const editingProjectLabel = useMemo(() => {
    if (!editingTask) {
      return null
    }

    const project = projects.find((item) => item.id === editingTask.projectId)
    if (project) {
      return project.code ? `${project.code} — ${project.name}` : project.name
    }

    const fallbackName = editingTask.projectName?.trim()
    return fallbackName || `Project #${editingTask.projectId}`
  }, [editingTask, projects])

  const emptyMessage = canCreateTask
    ? hasActiveFilters
      ? 'No tasks match your filters.'
      : 'No tasks yet. Use Add Task to create one.'
    : 'No tasks assigned to you yet.'

  async function ensureAssignableLoaded(projectId: number) {
    const id = Number(projectId)
    if (!Number.isFinite(id) || id <= 0 || assignableLoadStarted.current.has(id)) {
      return
    }

    assignableLoadStarted.current.add(id)
    setAssignableLoadingByProject((current) => ({ ...current, [id]: true }))

    try {
      const users = await getProjectAssignableUsers(id)
      setProjectAssignableUsers((current) => ({ ...current, [id]: users }))
    } catch {
      setProjectAssignableUsers((current) => ({ ...current, [id]: [] }))
    } finally {
      setAssignableLoadingByProject((current) => ({ ...current, [id]: false }))
    }
  }

  function refreshAssignableForProject(projectId: number) {
    const id = Number(projectId)
    if (!Number.isFinite(id) || id <= 0) {
      return
    }
    assignableLoadStarted.current.delete(id)
    void ensureAssignableLoaded(id)
  }

  function resetTaskForm() {
    setEditingId(null)
    setShowAddForm(false)
    setNewTaskName('')
    setNewTaskDescription('')
    setNewTaskStatus('')
    setNewTaskProjectId(projects[0]?.id ?? '')
    setFormErrors({})
  }

  function cancelAddForm() {
    setShowAddForm(false)
    setNewTaskName('')
    setNewTaskDescription('')
    setNewTaskStatus('')
    setNewTaskProjectId(projects[0]?.id ?? '')
    setFormErrors({})
  }

  function clearFilters() {
    setSearchInput('')
    setSearchQuery('')
    setStatusFilter('')
    setProjectFilter('')
    setCurrentPage(1)
  }

  function toggleAddForm() {
    if (showAddForm) {
      cancelAddForm()
      return
    }

    if (isEditing) {
      resetTaskForm()
    }

    setShowAddForm(true)
    window.requestAnimationFrame(() => {
      taskFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  function clearFieldError(field: keyof TaskFormErrors) {
    setFormErrors((current) => {
      if (!current[field]) {
        return current
      }

      const next = { ...current }
      delete next[field]
      return next
    })
  }

  async function loadTasks() {
    try {
      setLoading(true)
      setError(null)
      const data = await getTodos({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        projectId: projectFilter || undefined,
      })
      setTasks(data)
    } catch {
      setError('Could not load tasks. Check that the API is running.')
    } finally {
      setLoading(false)
    }
  }

  async function refreshTasksAfterTeamChange() {
    setRefreshing(true)
    try {
      const data = await getTodos({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        projectId: projectFilter || undefined,
      })
      setTasks(data)
      if (editingId !== null && !data.some((task) => task.id === editingId)) {
        resetTaskForm()
      }
    } catch {
      // Keep existing table data if background refresh fails.
    } finally {
      setRefreshing(false)
    }
  }

  async function handleAssign(taskId: number, userId: number) {
    try {
      setActionLoading({ type: 'assign', id: taskId })
      setError(null)
      await assignTodo(taskId, userId)
      await loadTasks()
      showSuccess('Task assigned successfully.')
    } catch {
      setError('Could not assign task.')
      setSuccessMessage(null)
    } finally {
      setActionLoading(null)
    }
  }

  function showSuccess(message: string) {
    setSuccessMessage(message)
    setError(null)
  }

  async function handleSubmitTask(event: FormEvent) {
    event.preventDefault()

    if (isEditing && !canEditTaskDetails) {
      if (!newTaskStatus) {
        setError('Please select a status.')
        return
      }
    } else {
      const errors = validateTaskForm({
        name: newTaskName,
        description: newTaskDescription,
      })

      if (hasFormErrors(errors)) {
        setFormErrors(errors)
        return
      }
    }

    const name = newTaskName.trim()
    const description = newTaskDescription.trim() || null
    setFormErrors({})

    if (isEditing) {
      const id = editingId

      try {
        setActionLoading({ type: 'edit', id })
        setError(null)
        if (canEditTaskDetails) {
          await updateTodo(id, {
            name,
            description,
            status: newTaskStatus as TaskStatus,
          })
          setTasks((current) =>
            current.map((item) =>
              item.id === id
                ? {
                    ...item,
                    name,
                    description,
                    status: newTaskStatus as TaskStatus,
                    updatedAt: new Date().toISOString(),
                  }
                : item,
            ),
          )
          resetTaskForm()
          showSuccess(`Task "${name}" updated successfully.`)
        } else {
          await updateTodoStatus(id, newTaskStatus as TaskStatus)
          setTasks((current) =>
            current.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: newTaskStatus as TaskStatus,
                    updatedAt: new Date().toISOString(),
                  }
                : item,
            ),
          )
          resetTaskForm()
          showSuccess('Task status updated successfully.')
        }
      } catch {
        setError(
          canEditTaskDetails
            ? 'Could not update task.'
            : 'Could not update task status.',
        )
        setSuccessMessage(null)
      } finally {
        setActionLoading(null)
      }

      return
    }

    try {
      setActionLoading({ type: 'create' })
      setError(null)
      if (!newTaskProjectId) {
        setError('Please select a project.')
        setActionLoading(null)
        return
      }
      const created = await createTodo({
        name,
        description,
        status: newTaskStatus || undefined,
        projectId: newTaskProjectId,
      })
      setTasks((current) => [created, ...current])
      resetTaskForm()
      showSuccess(`Task "${name}" created successfully.`)
    } catch {
      setError('Could not create task.')
      setSuccessMessage(null)
    } finally {
      setActionLoading(null)
    }
  }

  function startEdit(task: TaskItem) {
    setShowAddForm(false)
    setEditingId(task.id)
    setNewTaskName(task.name)
    setNewTaskDescription(task.description ?? '')
    setNewTaskStatus(task.status)
    setFormErrors({})
    setError(null)

    window.requestAnimationFrame(() => {
      taskFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  function cancelEdit() {
    resetTaskForm()
  }

  function requestDelete(id: number, name: string) {
    setDeleteTarget({ id, name })
  }

  function handleSort(key: SortKey) {
    setSortState((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        }
      }

      return { key, direction: 'asc' }
    })
    setCurrentPage(1)
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size)
    setCurrentPage(1)
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return
    }

    const { id, name } = deleteTarget

    try {
      setActionLoading({ type: 'delete', id })
      setError(null)
      await deleteTodo(id)
      setTasks((current) => current.filter((item) => item.id !== id))
      if (editingId === id) {
        resetTaskForm()
      }
      setDeleteTarget(null)
      showSuccess(`Task "${name}" deleted successfully.`)
    } catch {
      setError('Could not delete task.')
      setSuccessMessage(null)
    } finally {
      setActionLoading(null)
    }
  }

  function usersForTask(projectId: number) {
    return projectAssignableUsers[Number(projectId)] ?? []
  }

  function isAssignableLoading(projectId: number) {
    return assignableLoadingByProject[Number(projectId)] ?? false
  }

  function isAssignableLoaded(projectId: number) {
    return projectAssignableUsers[Number(projectId)] !== undefined
  }

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim())
    }, 400)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    void loadTasks()
  }, [searchQuery, statusFilter, projectFilter])

  useEffect(() => {
    if (tasksRefreshToken === 0) return

    let cancelled = false

    async function refreshTasksFromNotification() {
      const query = taskQueryRef.current
      setRefreshing(true)
      try {
        const data = await getTodos({
          search: query.searchQuery || undefined,
          status: query.statusFilter || undefined,
          projectId: query.projectFilter || undefined,
        })
        if (!cancelled) {
          setTasks(data)
        }
      } catch {
        // Keep existing table data if background refresh fails.
      } finally {
        if (!cancelled) {
          setRefreshing(false)
        }
      }
    }

    void refreshTasksFromNotification()

    return () => {
      cancelled = true
    }
  }, [tasksRefreshToken])

  useEffect(() => {
    if (projectsRefreshToken === 0) return

    let cancelled = false

    async function refreshProjectsFromNotification() {
      setProjectsLoading(true)
      try {
        const data = await getProjects()
        if (!cancelled) {
          setProjects(data)
        }
      } catch {
        // Keep existing project list if background refresh fails.
      } finally {
        if (!cancelled) {
          setProjectsLoading(false)
        }
      }
    }

    void refreshProjectsFromNotification()

    return () => {
      cancelled = true
    }
  }, [projectsRefreshToken])

  useEffect(() => {
    setProjectsLoading(true)
    getProjects()
      .then((data) => {
        setProjects(data)
        if (data.length > 0 && newTaskProjectId === '') {
          setNewTaskProjectId(data[0].id)
        }
      })
      .catch(() => {
        // project filter optional if fetch fails
      })
      .finally(() => setProjectsLoading(false))
  }, [])

  useEffect(() => {
    if (!canManageProjectTeam) return
    getAssignableUsers()
      .then(setAssignableUsers)
      .catch(() => {
        // assign UI optional if fetch fails
      })
  }, [canManageProjectTeam])

  useEffect(() => {
    if (!canAssign) {
      assignableLoadStarted.current.clear()
      setProjectAssignableUsers({})
      setAssignableLoadingByProject({})
      return
    }

    if (projects.length === 0) {
      return
    }

    projects.forEach((project) => {
      void ensureAssignableLoaded(project.id)
    })
  }, [canAssign, projects])

  useEffect(() => {
    if (!canAssign || tasks.length === 0) {
      return
    }

    const projectIds = new Set(tasks.map((task) => Number(task.projectId)))
    if (projectFilter !== '') {
      projectIds.add(Number(projectFilter))
    }

    projectIds.forEach((projectId) => {
      void ensureAssignableLoaded(projectId)
    })
  }, [canAssign, tasks, projectFilter])

  useEffect(() => {
    if (!successMessage) {
      return
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage(null)
    }, SUCCESS_DISMISS_MS)

    return () => window.clearTimeout(timer)
  }, [successMessage])

  return {
    userPermissions: {
      canEditTaskDetails,
      canCreateTask,
      canDeleteTask,
      canAssign,
      canManageProjectTeam,
    },
    filters: {
      searchInput,
      setSearchInput,
      searchQuery,
      statusFilter,
      setStatusFilter,
      projectFilter,
      setProjectFilter,
      clearFilters,
      isSearchDebouncing,
      isFilterLoading,
      hasActiveFilters,
      setCurrentPage,
    },
    tasks: {
      tasks,
      sortedTasks,
      paginatedTasks,
      loading,
      refreshing,
      emptyMessage,
    },
    pagination: {
      currentPage,
      setCurrentPage,
      pageSize,
      totalPages,
      handlePageSizeChange,
    },
    sort: {
      sortState,
      handleSort,
    },
    form: {
      taskFormRef: taskFormRef as RefObject<HTMLFormElement>,
      isEditing,
      editingId,
      editingProjectLabel,
      isNameDescriptionReadOnly,
      showAddForm,
      newTaskName,
      setNewTaskName,
      newTaskDescription,
      setNewTaskDescription,
      newTaskStatus,
      setNewTaskStatus,
      newTaskProjectId,
      setNewTaskProjectId,
      formErrors,
      setFormErrors,
      isFormSubmitting,
      isSavingEdit,
      handleSubmitTask,
      startEdit,
      cancelEdit,
      cancelAddForm,
      toggleAddForm,
      clearFieldError,
    },
    actions: {
      handleAssign,
      requestDelete,
      confirmDelete,
    },
    projects: {
      projects,
      projectsLoading,
      selectedProject,
      assignableUsers,
      refreshAssignableForProject,
      refreshTasksAfterTeamChange,
    },
    assignable: {
      usersForTask,
      isAssignableLoading,
      isAssignableLoaded,
    },
    ui: {
      error,
      setError,
      successMessage,
      setSuccessMessage,
      deleteTarget,
      setDeleteTarget,
      actionLoading,
      isDeleting,
    },
  }
}
