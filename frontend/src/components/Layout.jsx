import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  House, LayoutDashboard, FolderKanban, CheckSquare, Users,
  LogOut
} from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navItems = [
    { to: '/', icon: House, label: 'Home' },
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    ...(user?.role === 'admin' ? [{ to: '/team', icon: Users, label: 'Team' }] : []),
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-editorial-border bg-editorial-card/90 backdrop-blur-xl">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-editorial-border">
          <p className="section-label mb-2">Workspace</p>
          <span className="font-display text-2xl font-semibold text-editorial-foreground">Task Manager</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-editorial-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-9 h-9 rounded-md bg-editorial-muted border border-editorial-border flex items-center justify-center text-editorial-accent text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-editorial-foreground truncate">{user?.name}</p>
              <p className="section-label text-[0.65rem] capitalize tracking-[0.1em]">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-editorial-subtle hover:text-red-700 hover:bg-red-50 transition-all"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 lg:p-10 fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
