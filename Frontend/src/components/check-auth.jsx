import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/auth.jsx'

export default function RequireAuth({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function getRoleFromToken(token) {
  try {
    if (!token) return null
    const base64 = token.split('.')[1]
    const json = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')))
    return json?.role || null
  } catch { return null }
}

export function RequireRole({ roles = [], children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  const role = getRoleFromToken(token)
  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/" replace />
  }
  return children
}
