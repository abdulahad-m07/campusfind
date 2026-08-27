import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ username, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="page-description">Log in to report or claim items.</p>

        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Student PRN or @acpce.ac.in email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <button
          type="button"
          className="skip-btn"
          onClick={() => {
            try {
              localStorage.setItem('campusfind_skipped', '1')
            } catch {}
            navigate('/')
          }}
        >
          Skip for now — browse read-only
        </button>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
