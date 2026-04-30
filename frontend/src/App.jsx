import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import Tasks from './pages/Tasks'
import Team from './pages/Team'
import Layout from './components/Layout'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />

  return children
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="team" element={<ProtectedRoute adminOnly><Team /></ProtectedRoute>} />
        </Route>

        <Route
  path="*"
  element={
    user
      ? <Navigate to="/dashboard" replace />
      : <Navigate to="/login" replace />
  }
  />
      </Routes>
    </BrowserRouter>
  )
}
