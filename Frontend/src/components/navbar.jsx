import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth.jsx'
import { useState } from 'react'
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const role = typeof window !== 'undefined' ? getRole(token) : null
  
  const onLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <div className="nav">
      <div className="nav-inner">
        <div className="nav-brand">
          <Link to="/" className="brand" onClick={closeMenu}>
            <img src={logoUrl} alt="CSS logo" className="logo" />
          </Link>
          <span className="subtle">{token ? 'Authenticated' : 'Guest'}</span>
        </div>
        
        {/* Navigation links */}
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/tickets" onClick={closeMenu}>My Tickets</Link>
          {role === 'senior' && <Link to="/ticket" onClick={closeMenu}>Create</Link>}
          {role === 'senior' && <Link to="/admin" onClick={closeMenu}>Admin</Link>}
          {!token && <Link to="/login" onClick={closeMenu}>Login</Link>}
          {!token && <Link to="/signup" onClick={closeMenu}>Signup</Link>}
          {token && (
            <button className="btn btn-danger" onClick={() => { onLogout(); closeMenu(); }}>
              Logout
            </button>
          )}
        </div>
        
        {/* Hamburger menu button for mobile */}
        <button 
          className="nav-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>
    </div>
  )
}
