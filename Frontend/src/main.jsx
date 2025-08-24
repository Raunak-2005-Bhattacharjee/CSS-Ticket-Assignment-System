import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/auth.jsx'
import './index.css'
import Navbar from './components/navbar.jsx'
import { RequireRole } from './components/check-auth.jsx'
import LoginPage from './pages/login.jsx'
import SignupPage from './pages/signup.jsx'
import CreateTicketPage from './pages/ticket.jsx'
import MyTicketsPage from './pages/tickets.jsx'
import AdminPage from './pages/admin.jsx'

function Home() {
  return (
    <div className="container">
      <div className="card stack-lg">
        <div style={{ textAlign: 'center' }}>
          <h1 className="heading">CSS Ticket System</h1>
          <p className="subtle" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
            Use the navbar to login, signup, create tickets, or view your tickets.
          </p>
        </div>
        <div className="row" style={{ justifyContent: 'center', gap: '1rem' }}>
          <a href="/login" className="btn btn-primary">Get Started</a>
          <a href="/signup" className="btn">Create Account</a>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/ticket" element={<RequireRole roles={["senior"]}><CreateTicketPage /></RequireRole>} />
            <Route path="/tickets" element={<MyTicketsPage />} />
            <Route path="/admin" element={<RequireRole roles={["senior"]}><AdminPage /></RequireRole>} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
