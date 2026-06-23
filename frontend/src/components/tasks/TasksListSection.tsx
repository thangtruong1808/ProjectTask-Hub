import type { TaskItem } from '../../api/todos'
import type { UserDto } from '../../api/client'
import type { ActionLoading, SortKey, SortState } from './taskConstants'
import { PAGE_SIZE_OPTIONS } from './taskConstants'
import Spinner from '../Spinner'
import TablePagination from '../TablePagination'
import TaskDesktopTable from './TaskDesktopTable'
import TaskMobileCard from './TaskMobileCard'

interface TasksListSectionProps {
  tasks: TaskItem[]
  paginatedTasks: TaskItem[]
  sortedTasksCount: number
  emptyMessage: string
  refreshing: boolean
  isFilterLoading: boolean
  canAssign: boolean
  canDeleteTask: boolean
  sortState: SortState
  onSort: (key: SortKey) => void
  editingId: number | null
  actionLoading: ActionLoading
  isSavingEdit: boolean
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  usersForTask: (projectId: number) => UserDto[]
  isAssignableLoading: (projectId: number) => boolean
  isAssignableLoaded: (projectId: number) => boolean
  onAssign: (taskId: number, userId: number) => void
  onEdit: (task: TaskItem) => void
  onDelete: (id: number, name: string) => void
}

export default function TasksListSection({
  tasks,
  paginatedTasks,
  sortedTasksCount,
  emptyMessage,
  refreshing,
  isFilterLoading,
  canAssign,
  canDeleteTask,
  sortState,
  onSort,
  editingId,
  actionLoading,
  isSavingEdit,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  usersForTask,
  isAssignableLoading,
  isAssignableLoaded,
  onAssign,
  onEdit,
  onDelete,
}: TasksListSectionProps) {
  return (
    <div className="relative">
      {(refreshing || isFilterLoading) && (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center rounded-xl bg-white/60 pt-8 backdrop-blur-[1px] md:pt-10"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
            <Spinner size="sm" label={refreshing ? 'Refreshing tasks' : 'Loading filtered tasks'} />
            {refreshing ? 'Updating tasks...' : 'Applying filters...'}
          </span>
        </div>
      )}
      <>
        <div className="space-y-3 md:hidden">
          {tasks.length === 0 ? (
            <p className="rounded-xl border border-slate-200 px-4 py-12 text-center text-slate-500">
              {emptyMessage}
            </p>
          ) : (
            paginatedTasks.map((task, index) => {
              const isSelected = editingId === task.id
              const isRowDeleting =
                actionLoading?.type === 'delete' &&
                actionLoading.id === task.id
              const isRowAssigning =
                actionLoading?.type === 'assign' &&
                actionLoading.id === task.id
              const isRowEditing =
                actionLoading?.type === 'edit' &&
                actionLoading.id === task.id
              const sequenceNumber = (currentPage - 1) * pageSize + index + 1

              return (
                <TaskMobileCard
                  key={task.id}
                  task={task}
                  sequenceNumber={sequenceNumber}
                  isSelected={isSelected}
                  isRowDeleting={isRowDeleting}
                  isRowAssigning={isRowAssigning}
                  isRowEditing={isRowEditing}
                  isSavingEdit={isSavingEdit}
                  canAssign={canAssign}
                  canDeleteTask={canDeleteTask}
                  assignUsers={usersForTask(task.projectId)}
                  assignLoading={isAssignableLoading(task.projectId)}
                  assignLoaded={isAssignableLoaded(task.projectId)}
                  onAssign={onAssign}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )
            })
          )}

          {tasks.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={sortedTasksCount}
              pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          )}
        </div>

        <TaskDesktopTable
          tasks={tasks}
          paginatedTasks={paginatedTasks}
          sortedTasksCount={sortedTasksCount}
          emptyMessage={emptyMessage}
          canAssign={canAssign}
          canDeleteTask={canDeleteTask}
          sortState={sortState}
          onSort={onSort}
          editingId={editingId}
          actionLoading={actionLoading}
          isSavingEdit={isSavingEdit}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          usersForTask={usersForTask}
          isAssignableLoading={isAssignableLoading}
          isAssignableLoaded={isAssignableLoaded}
          onAssign={onAssign}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </>
    </div>
  )
}
