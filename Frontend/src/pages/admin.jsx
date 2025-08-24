import RequireAuth from '../components/check-auth.jsx'
import { useState, useEffect } from 'react'

export default function AdminPage() {
  const [email, setEmail] = useState('junior@example.com')
  const [skills, setSkills] = useState('react,node,mongodb')
  
  // Ticket assignment state
  const [unassignedTickets, setUnassignedTickets] = useState([])
  const [allTickets, setAllTickets] = useState([])
  const [availableJuniors, setAvailableJuniors] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [selectedJunior, setSelectedJunior] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('unassigned') // 'unassigned' or 'all'

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchUnassignedTickets()
      fetchAllTickets()
      fetchAvailableJuniors()
    }
  }, [])

  const fetchUnassignedTickets = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/tickets/unassigned', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json())
      
      if (res.success) {
        setUnassignedTickets(res.tickets)
      }
    } catch (err) {
      console.error('Failed to fetch unassigned tickets:', err)
    }
  }

  const fetchAllTickets = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/tickets/all', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json())
      
      if (res.success) {
        setAllTickets(res.tickets)
      }
    } catch (err) {
      console.error('Failed to fetch all tickets:', err)
    }
  }

  const fetchAvailableJuniors = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/tickets/juniors', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json())
      
      if (res.success) {
        setAvailableJuniors(res.juniors)
      }
    } catch (err) {
      console.error('Failed to fetch available juniors:', err)
    }
  }

  const refreshData = () => {
    fetchUnassignedTickets()
    fetchAllTickets()
    fetchAvailableJuniors()
  }

  const seed = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/auth/seed-junior', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          email, 
          password: 'password', 
          skills: skills.split(',').map(s => s.trim()).filter(Boolean) 
        })
      }).then(r => r.json())
      
      if (res.success) {
        alert('Junior seeded successfully!')
        setEmail('junior@example.com')
        setSkills('react,node,mongodb')
        fetchAvailableJuniors() // Refresh juniors list
      } else {
        alert(res?.message || 'Failed to seed junior')
      }
    } catch (err) {
      alert('Failed to seed junior')
    } finally {
      setLoading(false)
    }
  }

  const assignTicket = async () => {
    if (!selectedTicket || !selectedJunior) {
      alert('Please select both a ticket and a junior')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/tickets/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ticketId: selectedTicket._id,
          juniorId: selectedJunior
        })
      }).then(r => r.json())

      if (res.success) {
        alert('Ticket assigned successfully!')
        setSelectedTicket(null)
        setSelectedJunior('')
        refreshData() // Refresh all data
      } else {
        alert(res?.message || 'Failed to assign ticket')
      }
    } catch (err) {
      alert('Failed to assign ticket')
    } finally {
      setLoading(false)
    }
  }

  const unassignTicket = async (ticketId) => {
    if (!confirm('Are you sure you want to unassign this ticket?')) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/tickets/${ticketId}/unassign`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json())

      if (res.success) {
        alert('Ticket unassigned successfully!')
        refreshData() // Refresh all data
      } else {
        alert(res?.message || 'Failed to unassign ticket')
      }
    } catch (err) {
      alert('Failed to unassign ticket')
    } finally {
      setLoading(false)
    }
  }

  const getSkillMatchPercentage = (ticketSkills, juniorSkills) => {
    if (!ticketSkills || !ticketSkills.length || !juniorSkills || !juniorSkills.length) return 0
    
    const matchingSkills = ticketSkills.filter(skill => 
      juniorSkills.some(juniorSkill => 
        juniorSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(juniorSkill.toLowerCase())
      )
    )
    
    return Math.round((matchingSkills.length / ticketSkills.length) * 100)
  }

  return (
    <RequireAuth>
      <div className="container">
        <div className="card stack">
          <div style={{ textAlign: 'center' }}>
            <h1 className="heading">Admin Dashboard</h1>
            <p className="subtle">Manage juniors and ticket assignments.</p>
          </div>

          {/* Junior Seeding Section */}
          <div className="card stack">
            <h2>Seed New Junior</h2>
            <form onSubmit={seed} className="stack">
              <div>
                <label className="label">Junior Email</label>
                <input 
                  className="input" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter junior email"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="label">Skills (comma-separated)</label>
                <input 
                  className="input" 
                  value={skills} 
                  onChange={e => setSkills(e.target.value)}
                  placeholder="e.g., react, node, mongodb"
                  disabled={loading}
                  required
                />
              </div>
              <div className="row">
                <button 
                  className="btn btn-primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Seeding...' : 'Seed Junior'}
                </button>
              </div>
            </form>
          </div>

          {/* Ticket Assignment Section */}
          <div className="card stack">
            <div className="row space-between">
              <h2>Ticket Assignment Management</h2>
              <button className="btn" onClick={refreshData} disabled={loading}>
                Refresh
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="row gap">
              <button
                className={`btn ${activeTab === 'unassigned' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('unassigned')}
              >
                Unassigned ({unassignedTickets.length})
              </button>
              <button
                className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('all')}
              >
                All ({allTickets.length})
              </button>
            </div>

            {/* Unassigned Tickets Tab */}
            {activeTab === 'unassigned' && (
              <div className="stack">
                <h3>Unassigned Tickets</h3>
                {unassignedTickets.length === 0 ? (
                  <p className="subtle">No unassigned tickets found.</p>
                ) : (
                  <div className="stack">
                    {unassignedTickets.map(ticket => (
                      <div key={ticket._id} className="card">
                        <div className="stack">
                          <div>
                            <h4>{ticket.title}</h4>
                            <p className="subtle">{ticket.description}</p>
                            <div className="row gap">
                              <span className="badge">{ticket.priority || 'medium'}</span>
                              <span className="badge">Status: {ticket.status}</span>
                              {ticket.relatedSkills && ticket.relatedSkills.length > 0 && (
                                <span className="badge">Skills: {ticket.relatedSkills.join(', ')}</span>
                              )}
                            </div>
                            <p className="subtle">Created by: {ticket.createdBy?.email}</p>
                            {ticket.assignedTo && (
                              <p className="subtle">Assigned to: {ticket.assignedTo.email}</p>
                            )}
                          </div>
                          <div className="row gap">
                            {!ticket.assignedTo && (
                              <button
                                className="btn btn-secondary"
                                onClick={() => setSelectedTicket(ticket)}
                                disabled={loading}
                              >
                                Assign
                              </button>
                            )}
                            {ticket.assignedTo && ticket.status !== 'COMPLETED' && (
                              <button
                                className="btn btn-danger"
                                onClick={() => unassignTicket(ticket._id)}
                                disabled={loading}
                              >
                                Unassign
                              </button>
                            )}
                            {ticket.assignedTo && ticket.status === 'COMPLETED' && (
                              <span className="badge badge-success">Completed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Tickets Tab */}
            {activeTab === 'all' && (
              <div className="stack">
                <h3>All Tickets</h3>
                {allTickets.length === 0 ? (
                  <p className="subtle">No tickets found.</p>
                ) : (
                  <div className="stack">
                    {allTickets.map(ticket => (
                      <div key={ticket._id} className="card">
                        <div className="stack">
                          <div>
                            <h4>{ticket.title}</h4>
                            <p className="subtle">{ticket.description}</p>
                            <div className="row gap">
                              <span className="badge">{ticket.priority || 'medium'}</span>
                              <span className="badge">Status: {ticket.status}</span>
                              {ticket.relatedSkills && ticket.relatedSkills.length > 0 && (
                                <span className="badge">Skills: {ticket.relatedSkills.join(', ')}</span>
                              )}
                            </div>
                            <p className="subtle">Created by: {ticket.createdBy?.email}</p>
                            {ticket.assignedTo && (
                              <p className="subtle">Assigned to: {ticket.assignedTo.email}</p>
                            )}
                          </div>
                          <div className="row gap">
                            {!ticket.assignedTo && (
                              <button
                                className="btn btn-secondary"
                                onClick={() => setSelectedTicket(ticket)}
                                disabled={loading}
                              >
                                Assign
                              </button>
                            )}
                            {ticket.assignedTo && ticket.status !== 'COMPLETED' && (
                              <button
                                className="btn btn-danger"
                                onClick={() => unassignTicket(ticket._id)}
                                disabled={loading}
                              >
                                Unassign
                              </button>
                            )}
                            {ticket.assignedTo && ticket.status === 'COMPLETED' && (
                              <span className="badge badge-success">Completed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Assignment Modal */}
          {selectedTicket && (
            <div className="modal-overlay">
              <div className="modal card stack">
                <h3>Assign Ticket: {selectedTicket.title}</h3>
                <p className="subtle">Select a junior to assign this ticket to:</p>
                
                {/* Ticket Skills Display */}
                {selectedTicket.relatedSkills && selectedTicket.relatedSkills.length > 0 && (
                  <div className="card">
                    <h4>Required Skills</h4>
                    <div className="row gap">
                      {selectedTicket.relatedSkills.map(skill => (
                        <span key={skill} className="badge">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="label">Select Junior</label>
                  <select 
                    className="select" 
                    value={selectedJunior} 
                    onChange={e => setSelectedJunior(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Choose a junior...</option>
                    {availableJuniors.map(junior => {
                      const matchPercentage = getSkillMatchPercentage(
                        selectedTicket.relatedSkills, 
                        junior.skills
                      )
                      const experienceLevel = junior.experience || 0
                      let recommendation = ''
                      
                      if (matchPercentage >= 80 && experienceLevel >= 5) {
                        recommendation = '⭐ Perfect Match'
                      } else if (matchPercentage >= 60 && experienceLevel >= 3) {
                        recommendation = '👍 Good Match'
                      } else if (matchPercentage >= 40) {
                        recommendation = '📚 Learning Opportunity'
                      } else {
                        recommendation = '⚠️ Low Match'
                      }
                      
                      return (
                        <option key={junior._id} value={junior._id}>
                          {junior.email} - {recommendation} - Experience: {experienceLevel} tasks - Skills: {junior.skills.join(', ')} 
                          {matchPercentage > 0 && ` (${matchPercentage}% match)`}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Selected Junior Info */}
                {selectedJunior && (
                  <div className="card">
                    <h4>Selected Junior Details</h4>
                    {(() => {
                      const junior = availableJuniors.find(j => j._id === selectedJunior)
                      if (!junior) return null
                      
                      const matchPercentage = getSkillMatchPercentage(
                        selectedTicket.relatedSkills, 
                        junior.skills
                      )
                      
                      return (
                        <div className="stack">
                          <p><strong>Email:</strong> {junior.email}</p>
                          <p><strong>Experience:</strong> {junior.experience || 0} completed tasks</p>
                          <p><strong>Skills:</strong> {junior.skills.join(', ')}</p>
                          <p><strong>Skill Match:</strong> {matchPercentage}%</p>
                          {matchPercentage < 50 && (
                            <p className="subtle">⚠️ This junior may need additional support for this task.</p>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}

                <div className="row gap">
                  <button
                    className="btn btn-primary"
                    onClick={assignTicket}
                    disabled={!selectedJunior || loading}
                  >
                    {loading ? 'Assigning...' : 'Assign Ticket'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedTicket(null)
                      setSelectedJunior('')
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  )
}
