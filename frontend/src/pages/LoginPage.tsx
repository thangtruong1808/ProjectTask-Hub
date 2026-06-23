import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../api/auth'
import { EmailIcon, LoginIcon, LockIcon } from '../components/icons/Icons'
import AlertMessage from '../components/ui/AlertMessage'
import AuthCard from '../components/ui/AuthCard'
import { FormField } from '../components/ui/FormField'
import SubmitButton from '../components/ui/SubmitButton'
import { setCredentials, type AppDispatch } from '../store'
import { usePageDocumentTitle } from '../hooks/useDocumentTitle'

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  usePageDocumentTitle('signIn', loading)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await login({ email, password })
      dispatch(setCredentials(data))
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      titleIcon={<LoginIcon size={20} />}
      title="Sign in"
      subtitle="Access your workspace and stay on top of your tasks."
      footer={
        <span>
          <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
            Forgot password?
          </Link>
          {' · '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
            Create account
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          icon={<EmailIcon size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={loading}
          autoComplete="email"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          icon={<LockIcon size={18} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          disabled={loading}
          autoComplete="current-password"
        />
        {error && <AlertMessage variant="error" message={error} />}
        <SubmitButton loading={loading} loadingLabel="Signing in..." icon={<LoginIcon size={18} />}>
          Sign in
        </SubmitButton>
      </form>
    </AuthCard>
  )
}
