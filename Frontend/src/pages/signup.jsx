import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/auth.jsx'

export default function SignupPage() {
  const [email, setEmail] = useState('senior@example.com')
  const [password, setPassword] = useState('password')
  const [role, setRole] = useState('senior')
  const [skills, setSkills] = useState('react,node,mongodb')
  const navigate = useNavigate()
  const { setToken } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/auth/signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role, skills: skills.split(',').map(s => s.trim()).filter(Boolean) })
    }).then(r => r.json())
    if (res?.token) {
      setToken(res.token)
      navigate('/tickets')
    } else {
      alert(res?.message || 'Signup failed')
    }
  }

  return (
    <div className="container">
      <div className="card stack">
        <div style={{ textAlign: 'center' }}>
          <h1 className="heading">Create account</h1>
          <p className="subtle">Choose a role; seniors can create and assign tickets.</p>
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
          <div>
            <label className="label">Role</label>
            <select className="select" value={role} onChange={e => setRole(e.target.value)} required>
              <option value="senior">Senior</option>
              <option value="junior">Junior</option>
              <option value="user">User</option>
            </select>
          </div>
          <div>
            <label className="label">Skills (comma-separated)</label>
            <input 
              className="input" 
              value={skills} 
              onChange={e => setSkills(e.target.value)}
              placeholder="e.g., react, node, mongodb"
            />
          </div>
          <div className="row">
            <button className="btn btn-primary" type="submit">Create account</button>
            <Link className="btn" to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
