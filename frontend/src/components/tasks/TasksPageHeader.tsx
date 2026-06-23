import { ClipboardIcon, PlusIcon, XMarkIcon } from '../icons/Icons'
import PageHeader from '../ui/PageHeader'

interface TasksPageHeaderProps {
  canCreateTask: boolean
  isEditing: boolean
  showAddForm: boolean
  isFormSubmitting: boolean
  onToggleAddForm: () => void
}

export default function TasksPageHeader({
  canCreateTask,
  isEditing,
  showAddForm,
  isFormSubmitting,
  onToggleAddForm,
}: TasksPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <PageHeader
        className="mb-0 min-w-0 flex-1"
        icon={<ClipboardIcon size={24} />}
        title="Tasks"
        subtitle="Search, filter, and manage work across your projects."
      />
      {canCreateTask && !isEditing && (
        <button
          type="button"
          onClick={onToggleAddForm}
          disabled={isFormSubmitting}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${showAddForm
              ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          aria-expanded={showAddForm}
        >
          {showAddForm ? (
            <>
              <XMarkIcon size={16} />
              Cancel
            </>
          ) : (
            <>
              <PlusIcon size={16} />
              Add Task
            </>
          )}
        </button>
      )}
    </div>
  )
}
