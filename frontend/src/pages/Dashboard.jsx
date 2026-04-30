import { useEffect, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { CheckCircle2, Clock, AlertTriangle, FolderKanban, ListTodo, Users, TrendingUp } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-white">{value ?? '—'}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    'Todo': 'badge-todo',
    'In Progress': 'badge-in_progress',
    'Completed': 'badge-completed',
    'Overdue': 'badge-overdue',
  }
  return <span className={map[status] || 'badge-todo'}>{status}</span>
}

function PriorityDot({ priority }) {
  const colors = { Low: 'bg-slate-400', Medium: 'bg-amber-400', High: 'bg-red-400' }
  return <span className={`w-2 h-2 rounded-full inline-block ${colors[priority] || 'bg-slate-400'}`} />
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-editorial-border pb-8">
        <p className="section-label mb-3">Dashboard</p>
        <h1 className="page-title">
          Keep today’s work clear, {user?.name?.split(' ')[0]}.
        </h1>
        <p className="text-editorial-subtle mt-3 text-base leading-7">
          A concise view of active projects, unfinished work, and team progress.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderKanban} label="Total Projects" value={stats?.total_projects}
          color="text-indigo-400" bg="bg-indigo-500/10" />
        <StatCard icon={ListTodo} label="Total Tasks" value={stats?.total_tasks}
          color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats?.completed_tasks}
          color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats?.overdue_tasks}
          color="text-red-400" bg="bg-red-500/10" />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="In Progress" value={stats?.in_progress_tasks}
          color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard icon={ListTodo} label="Todo" value={stats?.todo_tasks}
          color="text-slate-400" bg="bg-slate-700/40" />
        <StatCard icon={TrendingUp} label="Pending" value={stats?.pending_tasks}
          color="text-amber-400" bg="bg-amber-500/10" />
        {user?.role === 'admin' && (
          <StatCard icon={Users} label="Team Members" value={stats?.total_members}
            color="text-violet-400" bg="bg-violet-500/10" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-white mb-4 text-lg">Recent Tasks</h2>
          {stats?.recent_tasks?.length === 0 ? (
            <p className="text-slate-500 text-sm">No tasks yet.</p>
          ) : (
            <div className="space-y-3">
              {stats?.recent_tasks?.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                  <PriorityDot priority={task.priority} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{task.project_title}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Member Productivity (admin only) */}
        {user?.role === 'admin' && (
          <div className="card p-6">
            <h2 className="font-display font-bold text-white mb-4 text-lg">Member Productivity</h2>
            {stats?.member_stats?.length === 0 ? (
              <p className="text-slate-500 text-sm">No members yet.</p>
            ) : (
              <div className="space-y-3">
                {stats?.member_stats?.map(m => {
                  const pct = m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0
                  return (
                    <div key={m.user_id} className="p-3 rounded-xl bg-slate-800/40">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-600/20 flex items-center justify-center text-indigo-300 text-xs font-bold">
                            {m.name[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm text-slate-300">{m.name}</span>
                        </div>
                        <span className="text-xs text-slate-500">{m.completed}/{m.total} done</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
