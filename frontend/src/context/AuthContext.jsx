import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { register, login, fetchMe } from '../services/api'

const AuthContext = createContext(null)

function loadStored() {
  try {
    const token = localStorage.getItem('campusfind_token')
    const user = localStorage.getItem('campusfind_user')
    if (token && user) {
      return { token, user: JSON.parse(user) }
    }
  } catch {}
  return { token: null, user: null }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStored)

  const handleRegister = useCallback(
    async (data) => {
      const result = await register(data)
      try {
        localStorage.removeItem('campusfind_skipped')
      } catch {}
      localStorage.setItem('campusfind_token', result.token)
      localStorage.setItem('campusfind_user', JSON.stringify(result.user))
      setAuth({ token: result.token, user: result.user })
      return result.user
    },
    []
  )

  const handleLogin = useCallback(
    async (data) => {
      const result = await login(data)
      try {
        localStorage.removeItem('campusfind_skipped')
      } catch {}
      localStorage.setItem('campusfind_token', result.token)
      localStorage.setItem('campusfind_user', JSON.stringify(result.user))
      setAuth({ token: result.token, user: result.user })
      return result.user
    },
    []
  )

  const handleLogout = useCallback(() => {
    localStorage.removeItem('campusfind_token')
    localStorage.removeItem('campusfind_user')
    setAuth({ token: null, user: null })
  }, [])

  useEffect(() => {
    if (!auth.token) return
    let cancelled = false
    fetchMe()
      .then((user) => {
        if (!cancelled) {
          localStorage.setItem('campusfind_user', JSON.stringify(user))
          setAuth((prev) => ({ ...prev, user }))
        }
      })
      .catch(() => {
        if (!cancelled) handleLogout()
      })
    return () => {
      cancelled = true
    }
  }, [auth.token, handleLogout])

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        token: auth.token,
        isAuthenticated: !!auth.token,
        register: handleRegister,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
