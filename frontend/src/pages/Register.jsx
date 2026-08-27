import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function usernameRole(username) {
  if (/^\d{9}$/.test(username)) return 'student'
  if (/^[^\s@]+@acpce\.ac\.in$/i.test(username)) return 'faculty'
  return null
}

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const role = usernameRole(username)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!role) {
      setError('Invalid username. Use a 9-digit PRN (student) or an @acpce.ac.in email (faculty).')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await register({ name, username, password, role })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p className="page-description">Sign up as a student or faculty member.</p>

        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Johnson"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Student: 9-digit PRN · Faculty: you@acpce.ac.in"
            required
          />
          <p className="auth-hint">
            {role === 'student'
              ? 'Detected role: Student'
              : role === 'faculty'
                ? 'Detected role: Faculty'
                : 'Students use their 9-digit PRN, faculty use their @acpce.ac.in email.'}
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 4 characters"
            minLength={4}
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading || !role}>
          {loading ? 'Creating account...' : 'Sign Up'}
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
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
