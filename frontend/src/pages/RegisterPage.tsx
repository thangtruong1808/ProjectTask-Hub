import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { register } from '../api/auth'
import Spinner from '../components/Spinner'
import { setCredentials, type AppDispatch } from '../store'

export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await register({
        ...form,
        phone: form.phone || null,
      })
      dispatch(setCredentials(data))
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Create account</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="First name" required value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} disabled={loading} />
        <input type="text" placeholder="Last name" required value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} disabled={loading} />
        <input type="email" placeholder="Email" required value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} disabled={loading} />
        <input type="password" placeholder="Password (min 8 chars)" required minLength={8} value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} disabled={loading} />
        <input type="tel" placeholder="Phone (optional)" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} disabled={loading} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-70">
          {loading && <Spinner size="sm" label="Registering" />}
          Register
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        <Link to="/login" className="text-blue-600 hover:underline">Already have an account?</Link>
      </p>
    </div>
  )
}
