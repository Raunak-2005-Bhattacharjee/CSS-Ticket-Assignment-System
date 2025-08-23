import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RequireAuth from '../components/check-auth.jsx'

export default function CreateTicketPage() {
  const [title, setTitle] = useState('Build dashboard')
  const [description, setDescription] = useState('Build a React dashboard that fetches from Node/Express and MongoDB.')
  const navigate = useNavigate()

  const create = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, description })
      })
      const res = await response.json().catch(() => ({}))
      if (response.ok && res?.success) {
        navigate('/tickets')
      } else {
        const msg = res?.message || `Failed (${response.status})`
        alert(msg)
      }
    } catch (err) {
      alert('Network error')
    }
  }

  return (
    <RequireAuth>
      <div className="container">
        <div className="card stack">
          <div>
            <h1 className="heading">Create ticket</h1>
            <p className="subtle">Describe the work; skills will be extracted automatically.</p>
          </div>
          <form onSubmit={create} className="stack">
            <div>
              <label className="label">Title</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="row">
              <button className="btn btn-primary" type="submit">Create</button>
            </div>
          </form>
        </div>
      </div>
    </RequireAuth>
  )
}
