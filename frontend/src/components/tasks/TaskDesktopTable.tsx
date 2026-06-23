import type { TaskItem } from '../../api/todos'
import type { UserDto } from '../../api/client'
import TablePagination from '../TablePagination'
import { PAGE_SIZE_OPTIONS, type ActionLoading, type SortKey, type SortState } from './taskConstants'
import TaskSortableHeader from './TaskSortableHeader'
import TaskTableRow from './TaskTableRow'

interface TaskDesktopTableProps {
  tasks: TaskItem[]
  paginatedTasks: TaskItem[]
  sortedTasksCount: number
  emptyMessage: string
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

export default function TaskDesktopTable({
  tasks,
  paginatedTasks,
  sortedTasksCount,
  emptyMessage,
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
}: TaskDesktopTableProps) {
  return (
    <div className="hidden rounded-xl border border-slate-200 md:block">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="w-[3rem] whitespace-nowrap px-3 py-3 sm:px-4">
              #
            </th>
            <TaskSortableHeader
              label="ID"
              sortKey="id"
              currentSort={sortState}
              onSort={onSort}
              className="w-[3.5rem] whitespace-nowrap px-3 py-3 sm:px-4"
            />
            <TaskSortableHeader
              label="Name"
              sortKey="name"
              currentSort={sortState}
              onSort={onSort}
              className="w-[18%] px-3 py-3 sm:px-4"
            />
            <TaskSortableHeader
              label="Description"
              sortKey="description"
              currentSort={sortState}
              onSort={onSort}
              className="hidden w-[22%] px-3 py-3 lg:table-cell sm:px-4"
            />
            <TaskSortableHeader
              label="Status"
              sortKey="status"
              currentSort={sortState}
              onSort={onSort}
              className="w-[7.5rem] whitespace-nowrap px-3 py-3 sm:px-4"
            />
            <TaskSortableHeader
              label="Created"
              sortKey="createdAt"
              currentSort={sortState}
              onSort={onSort}
              className="hidden w-[11rem] whitespace-nowrap px-3 py-3 lg:table-cell sm:px-4"
            />
            <TaskSortableHeader
              label="Updated"
              sortKey="updatedAt"
              currentSort={sortState}
              onSort={onSort}
              className="hidden w-[11rem] whitespace-nowrap px-3 py-3 xl:table-cell sm:px-4"
            />
            {canAssign && (
              <th className="hidden w-[10rem] whitespace-nowrap px-3 py-3 lg:table-cell sm:px-4">
                Assign to
              </th>
            )}
            <th className="w-[9.5rem] whitespace-nowrap px-3 py-3 text-right sm:px-4">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.length === 0 ? (
            <tr>
              <td
                colSpan={canAssign ? 9 : 8}
                className="px-4 py-12 text-center text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
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
                <TaskTableRow
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
        </tbody>
      </table>

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
  )
}
