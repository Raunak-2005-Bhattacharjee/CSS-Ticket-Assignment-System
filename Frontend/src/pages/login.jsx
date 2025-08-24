import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/auth.jsx'

export default function LoginPage() {
  const [email, setEmail] = useState('senior@example.com')
  const [password, setPassword] = useState('password')
  const navigate = useNavigate()
  const { setToken } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json())
    if (res?.token) {
      setToken(res.token)
      navigate('/tickets')
    } else {
      alert(res?.message || 'Login failed')
    }
  }

  return (
    <div className="container">
      <div className="card stack">
        <div style={{ textAlign: 'center' }}>
          <h1 className="heading">Login</h1>
          <p className="subtle">Access your account to manage tickets.</p>
        </div>
        <form onSubmit={submit} className="stack">
          <div>
            <label className="label">Email</label>
            <input 
              className="input" 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input 
              className="input" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="row">
            <button className="btn btn-primary" type="submit">Login</button>
            <Link className="btn" to="/signup">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
