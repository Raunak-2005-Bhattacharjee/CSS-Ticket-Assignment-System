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
    <div style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h1>CSS Ticket System</h1>
      <p>Use the navbar to login, signup, create tickets, or view your tickets.</p>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="page">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/ticket" element={<RequireRole roles={["senior"]}><CreateTicketPage /></RequireRole>} />
              <Route path="/tickets" element={<MyTicketsPage />} />
              <Route path="/admin" element={<RequireRole roles={["senior"]}><AdminPage /></RequireRole>} />
            </Routes>
          </div>
        </main>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
