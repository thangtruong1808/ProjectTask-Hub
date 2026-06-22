import { useEffect, useState, type FormEvent } from 'react'
import { useDispatch } from 'react-redux'
import { changePassword, getProfile, updateProfile } from '../api/users'
import InlineMessage from '../components/InlineMessage'
import Spinner from '../components/Spinner'
import { updateUser, type AppDispatch } from '../store'

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getProfile()
      .then((p) => {
        setFirstName(p.firstName)
        setLastName(p.lastName)
        setPhone(p.phone ?? '')
        setEmail(p.email)
        dispatch(updateUser(p))
      })
      .catch(() => setError('Could not load profile'))
      .finally(() => setLoading(false))
  }, [dispatch])

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await updateProfile({ firstName, lastName, phone: phone || null })
      const p = await getProfile()
      dispatch(updateUser(p))
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setPwdSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setSuccess('Password changed successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed')
    } finally {
      setPwdSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Spinner size="lg" label="Loading profile" />
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    )
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
      {success && <InlineMessage variant="success" message={success} onDismiss={() => setSuccess(null)} />}
      {error && <InlineMessage variant="error" message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleProfileSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-medium text-slate-900">Personal information</h2>
        <input type="email" value={email} disabled className={`${inputClass} bg-slate-50 text-slate-500`} />
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass} disabled={saving} />
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} disabled={saving} />
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className={inputClass} disabled={saving} />
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-70">
          {saving && <Spinner size="sm" label="Saving profile" />}
          Save profile
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-medium text-slate-900">Change password</h2>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" required className={inputClass} disabled={pwdSaving} />
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" required minLength={8} className={inputClass} disabled={pwdSaving} />
        <button type="submit" disabled={pwdSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-70">
          {pwdSaving && <Spinner size="sm" label="Changing password" />}
          Change password
        </button>
      </form>
    </div>
  )
}
