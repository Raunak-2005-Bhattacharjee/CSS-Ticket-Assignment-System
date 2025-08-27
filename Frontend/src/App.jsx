import { useEffect, useState } from 'react'
import { buildApiUrl } from './config.js'

const api = {
  signup: (body) => fetch(buildApiUrl('/api/auth/signup'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  login: (body) => fetch(buildApiUrl('/api/auth/login'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  seedJunior: (body, token) => fetch(buildApiUrl('/api/auth/seed-junior'), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }).then(r => r.json()),
  createTicket: (body, token) => fetch(buildApiUrl('/api/tickets'), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }).then(r => r.json()),
  myTickets: (token) => fetch(buildApiUrl('/api/tickets/me'), { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [email, setEmail] = useState('senior@example.com')
  const [password, setPassword] = useState('password')
  const [role, setRole] = useState('senior')
  const [skills, setSkills] = useState('react,node,mongodb')
  const [tickets, setTickets] = useState([])
  const [title, setTitle] = useState('Build dashboard')
  const [description, setDescription] = useState('Build a React dashboard that fetches from Node/Express and MongoDB.')

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
  }, [token])

  const doSignup = async () => {
    const res = await api.signup({ email, password, role, skills: skills.split(',').map(s => s.trim()).filter(Boolean) })
    if (res?.token) setToken(res.token)
    alert(res?.success ? 'Signed up' : res?.message || 'Signup failed')
  }

  const doLogin = async () => {
    const res = await api.login({ email, password })
    if (res?.token) setToken(res.token)
    alert(res?.success ? 'Logged in' : res?.message || 'Login failed')
  }

  const doSeedJunior = async () => {
    const res = await api.seedJunior({ email: 'junior@example.com', password: 'password', skills: skills.split(',').map(s => s.trim()).filter(Boolean) }, token)
    alert(res?.success ? 'Junior seeded' : res?.message || 'Seed failed')
  }

  const doCreateTicket = async () => {
    const res = await api.createTicket({ title, description, priority: 'medium' }, token)
    alert(res?.success ? 'Ticket created' : res?.message || 'Create failed')
  }

  const doMyTickets = async () => {
    const res = await api.myTickets(token)
    setTickets(res?.tickets || [])
  }

  const logout = () => { setToken(''); localStorage.removeItem('token') }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>CSS Ticket System</h1>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h2>Auth</h2>
          <label>Email<br /><input value={email} onChange={e => setEmail(e.target.value)} /></label><br />
          <label>Password<br /><input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label><br />
          <label>Role<br />
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="senior">senior</option>
              <option value="junior">junior</option>
              <option value="user">user</option>
            </select>
          </label><br />
          <label>Skills (comma-separated)<br /><input value={skills} onChange={e => setSkills(e.target.value)} /></label><br />
          <button onClick={doSignup}>Signup</button>
          <button onClick={doLogin} style={{ marginLeft: 8 }}>Login</button>
          <button onClick={logout} style={{ marginLeft: 8 }}>Logout</button>
          <div style={{ marginTop: 8 }}>Token: {token ? token.slice(0, 12) + '…' : '(none)'} </div>
          <hr />
          <button onClick={doSeedJunior}>Seed Junior</button>
        </div>
        <div style={{ flex: 1 }}>
          <h2>Create Ticket (senior)</h2>
          <label>Title<br /><input value={title} onChange={e => setTitle(e.target.value)} /></label><br />
          <label>Description<br /><textarea rows={6} value={description} onChange={e => setDescription(e.target.value)} /></label><br />
          <button onClick={doCreateTicket}>Create</button>
          <button onClick={doMyTickets} style={{ marginLeft: 8 }}>Refresh My Tickets</button>
          <ul>
            {tickets.map(t => (
              <li key={t._id}>
                <strong>{t.title}</strong> — {t.status}
                {Array.isArray(t.relatedSkills) && t.relatedSkills.length ? (
                  <span> | skills: {t.relatedSkills.join(', ')}</span>
                ) : null}
                {t.assignedTo ? <span> | assignedTo: {t.assignedTo}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}


