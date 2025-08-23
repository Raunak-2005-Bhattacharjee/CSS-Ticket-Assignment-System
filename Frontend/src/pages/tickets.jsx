import { useEffect, useMemo, useState } from 'react'
import RequireAuth from '../components/check-auth.jsx'

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [userExperience, setUserExperience] = useState(0)

  const role = useMemo(() => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null
      const base64 = token.split('.')[1]
      const json = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')))
      return json?.role || null
    } catch { return null }
  }, [])

  const load = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/tickets/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    setTickets(res?.tickets || [])
    
    // If user is a junior, get their experience
    if (role === 'junior') {
      try {
        const userRes = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
        if (userRes.success) {
          setUserExperience(userRes.user.experience || 0)
        }
      } catch (err) {
        console.error('Failed to fetch user experience:', err)
      }
    }
  }

  useEffect(() => { load() }, [role])

  const del = async (id) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        setTickets(prev => prev.filter(t => t._id !== id))
      } else {
        const j = await res.json().catch(() => ({}))
        alert(j?.message || `Delete failed (${res.status})`)
      }
    } catch {
      alert('Network error')
    }
  }

  const complete = async (id) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`/api/tickets/${id}/complete`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const j = await res.json().then(x => x.ticket)
        setTickets(prev => prev.map(t => t._id === id ? { ...t, status: j.status } : t))
        
        // Update experience for juniors
        if (role === 'junior') {
          setUserExperience(prev => prev + 1)
          alert(`Task completed! Your experience is now ${userExperience + 1} tasks.`)
        }
      } else {
        const j = await res.json().catch(() => ({}))
        alert(j?.message || `Complete failed (${res.status})`)
      }
    } catch {
      alert('Network error')
    }
  }

  return (
    <RequireAuth>
      <div className="container stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1 className="heading">My tickets</h1>
          <button className="btn" onClick={load}>Refresh</button>
        </div>
        
        {/* Experience Display for Juniors */}
        {role === 'junior' && (
          <div className="card">
            <div className="row space-between">
              <h3>Your Experience</h3>
              <span className="badge badge-success">Level {userExperience}</span>
            </div>
            <p className="subtle">You have completed {userExperience} tasks. Keep up the great work!</p>
          </div>
        )}
        
        <ul className="list">
          {tickets.map(t => (
            <li className="list-item" key={t._id}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="stack">
                  <strong>{t.title}</strong>
                  <span className="subtle">Status: {t.status}</span>
                  {Array.isArray(t.relatedSkills) && t.relatedSkills.length ? (
                    <span className="subtle">Skills: {t.relatedSkills.join(', ')}</span>
                  ) : null}
                  {t.helpfulNotes ? (
                    <span className="subtle">Notes: {t.helpfulNotes}</span>
                  ) : null}
                </div>
                <div className="row">
                  <div className={t.status === 'COMPLETED' ? 'badge badge-success' : 'subtle'} style={{ marginRight: '.5rem' }}>
                    {t.status === 'COMPLETED' ? 'Completed' : (t.assignedTo ? 'Assigned' : 'Unassigned')}
                  </div>
                  {role === 'junior' && t.assignedTo && t.status !== 'COMPLETED' && (
                    <button className="btn btn-success" onClick={() => complete(t._id)}>Mark Complete</button>
                  )}
                  {role === 'senior' && (
                    <button className="btn btn-danger" onClick={() => del(t._id)}>Delete</button>
                  )}
                </div>
              </div>
            </li>
          ))}
          {tickets.length === 0 && (
            <li className="list-item subtle">No tickets yet.</li>
          )}
        </ul>
      </div>
    </RequireAuth>
  )
}
