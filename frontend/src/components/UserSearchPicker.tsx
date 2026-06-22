import { useEffect, useId, useRef, useState } from 'react'
import type { UserDto } from '../api/client'
import { searchAssignableUsers, userDisplayName } from '../api/users'
import { MagnifyingGlassIcon, XMarkIcon } from './icons/Icons'
import Spinner from './Spinner'

const MIN_SEARCH_LENGTH = 2
const SEARCH_DEBOUNCE_MS = 350

interface UserSearchPickerProps {
  selectedUser: UserDto | null
  onSelect: (user: UserDto | null) => void
  excludeUserIds?: number[]
  disabled?: boolean
  placeholder?: string
  inputId?: string
}

export default function UserSearchPicker({
  selectedUser,
  onSelect,
  excludeUserIds = [],
  disabled = false,
  placeholder = 'Search by name or email...',
  inputId,
}: UserSearchPickerProps) {
  const generatedId = useId()
  const resolvedInputId = inputId ?? generatedId
  const listboxId = `${resolvedInputId}-listbox`

  const containerRef = useRef<HTMLDivElement>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<UserDto[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const isSearchDebouncing = searchInput.trim() !== searchQuery
  const trimmedInput = searchInput.trim()
  const showMinLengthHint =
    isOpen && trimmedInput.length > 0 && trimmedInput.length < MIN_SEARCH_LENGTH

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const query = searchQuery.trim()
    if (query.length < MIN_SEARCH_LENGTH) {
      setResults([])
      setSearching(false)
      setSearchError(null)
      return
    }

    let cancelled = false

    async function runSearch() {
      setSearching(true)
      setSearchError(null)
      try {
        const data = await searchAssignableUsers(query)
        if (!cancelled) {
          const excluded = new Set(excludeUserIds)
          setResults(data.filter((user) => !excluded.has(user.id)))
        }
      } catch {
        if (!cancelled) {
          setResults([])
          setSearchError('Could not search users. Please try again.')
        }
      } finally {
        if (!cancelled) {
          setSearching(false)
        }
      }
    }

    void runSearch()

    return () => {
      cancelled = true
    }
  }, [isOpen, searchQuery, excludeUserIds.join(',')])

  function handleClearSelection() {
    onSelect(null)
    setSearchInput('')
    setSearchQuery('')
    setResults([])
    setIsOpen(false)
  }

  function handleSelectUser(user: UserDto) {
    onSelect(user)
    setSearchInput('')
    setSearchQuery('')
    setResults([])
    setIsOpen(false)
    setSearchError(null)
  }

  const isBusy = searching || isSearchDebouncing
  const showDropdown = isOpen && !selectedUser
  const showNoResults =
    showDropdown &&
    !showMinLengthHint &&
    !isBusy &&
    !searchError &&
    searchQuery.trim().length >= MIN_SEARCH_LENGTH &&
    results.length === 0

  return (
    <div ref={containerRef} className="relative">
      {selectedUser ? (
        <div className="flex min-h-[42px] items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {userDisplayName(selectedUser)}
            </p>
            <p className="truncate text-xs text-slate-500">{selectedUser.email}</p>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            disabled={disabled}
            aria-label="Clear selected user"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white hover:text-slate-700 disabled:opacity-70"
          >
            <XMarkIcon size={14} />
          </button>
        </div>
      ) : (
        <>
          <label htmlFor={resolvedInputId} className="sr-only">
            Search user to assign
          </label>
          <div className="relative">
            <MagnifyingGlassIcon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id={resolvedInputId}
              type="search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                setIsOpen(true)
                setSearchError(null)
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false)
                }
              }}
              disabled={disabled}
              placeholder={placeholder}
              autoComplete="off"
              role="combobox"
              aria-expanded={showDropdown}
              aria-controls={listboxId}
              aria-busy={isBusy}
              className={`w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-10 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100 ${isBusy ? 'border-blue-200 bg-blue-50/30' : ''}`}
            />
            {isBusy && (
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner size="sm" label="Searching users" />
              </span>
            )}
          </div>

          {showDropdown && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              {showMinLengthHint && (
                <p className="px-3 py-2.5 text-xs text-slate-500">
                  Type at least {MIN_SEARCH_LENGTH} characters to search users.
                </p>
              )}

              {searchError && (
                <p className="px-3 py-2.5 text-xs text-red-600">{searchError}</p>
              )}

              {showNoResults && (
                <p className="px-3 py-2.5 text-xs text-slate-500">
                  No matching users found. Try another name or email.
                </p>
              )}

              {results.length > 0 && (
                <ul
                  id={listboxId}
                  role="listbox"
                  className="max-h-52 overflow-y-auto py-1"
                  aria-label="Search results"
                >
                  {results.map((user) => (
                    <li key={user.id} role="option" aria-selected={false}>
                      <button
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-blue-50"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900">
                            {userDisplayName(user)}
                          </span>
                          <span className="block truncate text-xs text-slate-500">
                            {user.email}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
