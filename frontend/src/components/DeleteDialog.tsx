import Spinner from './Spinner'

interface DeleteDialogProps {
  open: boolean
  taskName: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

function TrashIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 3h6m-7 4h8m-9 4v8a2 2 0 002 2h6a2 2 0 002-2v-8M10 11v6m4-6v6"
      />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function DeleteDialog({
  open,
  taskName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteDialogProps) {
  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close delete dialog"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onCancel}
        disabled={isDeleting}
      />
      <div
        role="alertdialog"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <TrashIcon />
          </div>
          <div>
            <h2
              id="delete-dialog-title"
              className="text-lg font-semibold text-slate-900"
            >
              Delete Task
            </h2>
            <p
              id="delete-dialog-description"
              className="mt-1 text-sm text-slate-600"
            >
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <span className="mt-0.5 text-amber-600">
            <WarningIcon />
          </span>
          <p>
            Are you sure you want to delete{' '}
            <span className="font-semibold">&quot;{taskName}&quot;</span>?
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting && <Spinner size="sm" label="Deleting task" />}
            Delete Task
          </button>
        </div>
      </div>
    </div>
  )
}
