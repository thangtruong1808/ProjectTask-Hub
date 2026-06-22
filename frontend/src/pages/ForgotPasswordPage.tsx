import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'
import Spinner from '../components/Spinner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<{ message: string; resetToken?: string; resetUrl?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await forgotPassword(email)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">Forgot password</h1>
      <p className="mb-6 text-sm text-slate-600">Dev mode: reset token is shown in the response.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" disabled={loading} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {result && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p>{result.message}</p>
            {result.resetToken && (
              <p className="mt-2 break-all font-mono text-xs">Token: {result.resetToken}</p>
            )}
            {result.resetUrl && (
              <Link to={result.resetUrl} className="mt-2 inline-block text-blue-600 hover:underline">
                Open reset page
              </Link>
            )}
          </div>
        )}
        <button type="submit" disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-70">
          {loading && <Spinner size="sm" label="Sending" />}
          Send reset link
        </button>
      </form>
      <p className="mt-4 text-center text-sm"><Link to="/login" className="text-blue-600 hover:underline">Back to login</Link></p>
    </div>
  )
}
