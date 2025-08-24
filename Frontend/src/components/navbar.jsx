import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth.jsx'
import logoUrl from '../assets/CSS_LOGO.png'

function getRole(token) {
  try {
    if (!token) return null
    const base64 = token.split('.')[1]
    const json = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')))
    return json?.role || null
  } catch { return null }
}

export default function Navbar() {
  const { token, logout } = useAuth()
  const role = typeof window !== 'undefined' ? getRole(token) : null
  const onLogout = () => {
    logout()
    window.location.href = '/login'
  }
  return (
    <div className="nav">
      <div className="nav-inner">
        <div className="row">
          <Link to="/" className="brand">
            <img src={logoUrl} alt="CSS logo" className="logo" />
          </Link>
          <span className="subtle">{token ? 'Authenticated' : 'Guest'}</span>
        </div>
        <div className="row">
          <Link to="/tickets">My Tickets</Link>
          {role === 'senior' && <Link to="/ticket">Create</Link>}
          {role === 'senior' && <Link to="/admin">Admin</Link>}
          {!token && <Link to="/login">Login</Link>}
          {!token && <Link to="/signup">Signup</Link>}
          {token && (
            <button className="btn btn-danger" onClick={onLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
