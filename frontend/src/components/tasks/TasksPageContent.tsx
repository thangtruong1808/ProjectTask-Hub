import DeleteDialog from '../DeleteDialog'
import InlineMessage from '../InlineMessage'
import ProjectMembersPanel from '../ProjectMembersPanel'
import { useTasksPage } from '../../hooks/useTasksPage'
import TaskFormPanel from './TaskFormPanel'
import TasksFiltersPanel from './TasksFiltersPanel'
import TasksListSection from './TasksListSection'
import TasksLoadingPanel from './TasksLoadingPanel'
import TasksPageHeader from './TasksPageHeader'
import TasksWelcomeSection from './TasksWelcomeSection'

export default function TasksPageContent() {
  const {
    userPermissions,
    filters,
    tasks,
    pagination,
    sort,
    form,
    actions,
    projects,
    assignable,
    ui,
  } = useTasksPage()

  const {
    canEditTaskDetails,
    canCreateTask,
    canDeleteTask,
    canAssign,
    canManageProjectTeam,
  } = userPermissions

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden">
      <TasksWelcomeSection isLoading={tasks.loading && tasks.tasks.length === 0} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <TasksPageHeader
          canCreateTask={canCreateTask}
          isEditing={form.isEditing}
          showAddForm={form.showAddForm}
          isFormSubmitting={form.isFormSubmitting}
          onToggleAddForm={form.toggleAddForm}
        />

        <TasksFiltersPanel
          searchInput={filters.searchInput}
          onSearchInputChange={filters.setSearchInput}
          statusFilter={filters.statusFilter}
          onStatusFilterChange={filters.setStatusFilter}
          projectFilter={filters.projectFilter}
          onProjectFilterChange={filters.setProjectFilter}
          projects={projects.projects}
          projectsLoading={projects.projectsLoading}
          loading={tasks.loading}
          tasksCount={tasks.tasks.length}
          isSearchDebouncing={filters.isSearchDebouncing}
          isFilterLoading={filters.isFilterLoading}
          hasActiveFilters={filters.hasActiveFilters}
          onClearFilters={filters.clearFilters}
          onPageReset={() => filters.setCurrentPage(1)}
        />

        {canManageProjectTeam && filters.projectFilter !== '' && projects.selectedProject && (
          <div className="mb-4">
            <ProjectMembersPanel
              projectId={filters.projectFilter}
              projectLabel={
                projects.selectedProject.code
                  ? `${projects.selectedProject.code} — ${projects.selectedProject.name}`
                  : projects.selectedProject.name
              }
              assignableUsers={projects.assignableUsers}
              onMembersChanged={() => {
                projects.refreshAssignableForProject(filters.projectFilter as number)
                void projects.refreshTasksAfterTeamChange()
              }}
            />
          </div>
        )}

        <TaskFormPanel
          taskFormRef={form.taskFormRef}
          isEditing={form.isEditing}
          editingId={form.editingId}
          editingProjectLabel={form.editingProjectLabel}
          isNameDescriptionReadOnly={form.isNameDescriptionReadOnly}
          canCreateTask={canCreateTask}
          canEditTaskDetails={canEditTaskDetails}
          showAddForm={form.showAddForm}
          projects={projects.projects}
          projectsLoading={projects.projectsLoading}
          newTaskName={form.newTaskName}
          onNewTaskNameChange={form.setNewTaskName}
          newTaskDescription={form.newTaskDescription}
          onNewTaskDescriptionChange={form.setNewTaskDescription}
          newTaskStatus={form.newTaskStatus}
          onNewTaskStatusChange={form.setNewTaskStatus}
          newTaskProjectId={form.newTaskProjectId}
          onNewTaskProjectIdChange={form.setNewTaskProjectId}
          formErrors={form.formErrors}
          onFormErrorsChange={form.setFormErrors}
          isFormSubmitting={form.isFormSubmitting}
          isSavingEdit={form.isSavingEdit}
          onSubmit={form.handleSubmitTask}
          onCancelEdit={form.cancelEdit}
          onCancelAddForm={form.cancelAddForm}
          onClearFieldError={form.clearFieldError}
        />

        {ui.successMessage && (
          <InlineMessage
            variant="success"
            message={ui.successMessage}
            onDismiss={() => ui.setSuccessMessage(null)}
          />
        )}

        {ui.error && (
          <InlineMessage
            variant="error"
            message={ui.error}
            onDismiss={() => ui.setError(null)}
          />
        )}

        {tasks.loading && tasks.tasks.length === 0 ? (
          <TasksLoadingPanel />
        ) : (
          <TasksListSection
            tasks={tasks.tasks}
            paginatedTasks={tasks.paginatedTasks}
            sortedTasksCount={tasks.sortedTasks.length}
            emptyMessage={tasks.emptyMessage}
            refreshing={tasks.refreshing}
            isFilterLoading={filters.isFilterLoading}
            canAssign={canAssign}
            canDeleteTask={canDeleteTask}
            sortState={sort.sortState}
            onSort={sort.handleSort}
            editingId={form.editingId}
            actionLoading={ui.actionLoading}
            isSavingEdit={form.isSavingEdit}
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setCurrentPage}
            onPageSizeChange={pagination.handlePageSizeChange}
            usersForTask={assignable.usersForTask}
            isAssignableLoading={assignable.isAssignableLoading}
            isAssignableLoaded={assignable.isAssignableLoaded}
            onAssign={actions.handleAssign}
            onEdit={form.startEdit}
            onDelete={actions.requestDelete}
          />
        )}

        {canDeleteTask && (
          <DeleteDialog
            open={ui.deleteTarget !== null}
            taskName={ui.deleteTarget?.name ?? ''}
            onConfirm={actions.confirmDelete}
            onCancel={() => {
              if (!ui.isDeleting) {
                ui.setDeleteTarget(null)
              }
            }}
            isDeleting={ui.isDeleting}
          />
        )}
      </div>
    </div>
  )
}
