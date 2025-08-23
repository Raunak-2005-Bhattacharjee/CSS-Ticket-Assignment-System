import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('token') || '' } catch { return '' }
  })

  useEffect(() => {
    try {
      if (token) localStorage.setItem('token', token)
      else localStorage.removeItem('token')
    } catch {}
  }, [token])

  const logout = () => setToken('')

  const value = useMemo(() => ({ token, setToken, logout }), [token])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


