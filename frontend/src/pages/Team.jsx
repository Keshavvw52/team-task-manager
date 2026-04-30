import { useEffect, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Users, CheckCircle2, Clock, ListTodo } from 'lucide-react'

export default function Team() {
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/tasks')
    ]).then(([usersRes, tasksRes]) => {
      setUsers(usersRes.data)
      setTasks(tasksRes.data)
    }).catch(() => toast.error('Failed to load team'))
      .finally(() => setLoading(false))
  }, [])

  const getUserStats = (userId) => {
    const userTasks = tasks.filter(t => t.assigned_to === userId)
    return {
      total: userTasks.length,
      completed: userTasks.filter(t => t.status === 'Completed').length,
      inProgress: userTasks.filter(t => t.status === 'In Progress').length,
      todo: userTasks.filter(t => t.status === 'Todo').length,
    }
  }

  const roleColors = {
    admin: 'text-indigo-400 bg-indigo-600/10 border-indigo-600/20',
    member: 'text-emerald-400 bg-emerald-600/10 border-emerald-600/20'
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Team</h1>
        <p className="text-slate-400 mt-1 text-sm">{users.length} member{users.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => {
          const stats = getUserStats(u.id)
          const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

          return (
            <div key={u.id} className="card p-5 hover:border-slate-700 transition-all">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-600/20 flex items-center justify-center text-indigo-300 text-lg font-bold flex-shrink-0">
                  {u.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200 truncate">{u.name}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${roleColors[u.role] || ''}`}>
                  {u.role}
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-xl bg-slate-800/40">
                  <p className="text-lg font-display font-bold text-slate-200">{stats.total}</p>
                  <p className="text-xs text-slate-600">Total</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-lg font-display font-bold text-emerald-400">{stats.completed}</p>
                  <p className="text-xs text-slate-600">Done</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <p className="text-lg font-display font-bold text-blue-400">{stats.inProgress}</p>
                  <p className="text-xs text-slate-600">Active</p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">Completion</span>
                  <span className="text-xs font-mono text-slate-400">{pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: pct === 100 ? '#10b981' : pct > 50 ? '#6366f1' : '#f59e0b'
                    }}
                  />
                </div>
              </div>

              {/* Member since */}
              <p className="text-xs text-slate-600 mt-3">
                Joined {new Date(u.created_at).toLocaleDateString()}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}