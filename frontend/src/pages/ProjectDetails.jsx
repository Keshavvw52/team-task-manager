import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, X, Users, Trash2, UserPlus } from 'lucide-react'

function StatusBadge({ status }) {
  const map = {
    'Todo': 'badge-todo',
    'In Progress': 'badge-in_progress',
    'Completed': 'badge-completed',
    'Overdue': 'badge-overdue',
  }
  return <span className={map[status] || 'badge-todo'}>{status}</span>
}

function PriorityBadge({ priority }) {
  const colors = {
    Low: 'text-slate-400 bg-slate-700/40',
    Medium: 'text-amber-400 bg-amber-500/10',
    High: 'text-red-400 bg-red-500/10'
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[priority] || ''}`}>
      {priority}
    </span>
  )
}

export default function ProjectDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const isAdmin = user?.role === 'admin'

  const fetchAll = async () => {
    try {
      const [proj, taskRes, memberRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project_id=${id}`),
        api.get(`/projects/${id}/members`)
      ])
      setProject(proj.data)
      setTasks(taskRes.data)
      setMembers(memberRes.data)

      if (isAdmin) {
        const usersRes = await api.get('/users')
        setAllUsers(usersRes.data)
      }
    } catch {
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [id])

  const handleAddMember = async () => {
    if (!selectedUser) return toast.error('Select a user')
    try {
      await api.post(`/projects/${id}/members`, { user_id: parseInt(selectedUser) })
      toast.success('Member added')
      setShowAddMember(false)
      setSelectedUser('')
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add member')
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member?')) return
    try {
      await api.delete(`/projects/${id}/members/${memberId}`)
      toast.success('Member removed')
      fetchAll()
    } catch {
      toast.error('Failed to remove member')
    }
  }

  const memberUserIds = members.map(m => m.user_id)
  const availableUsers = allUsers.filter(u => !memberUserIds.includes(u.id))

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!project) return <p className="text-slate-400">Project not found.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/projects" className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-white">{project.title}</h1>
          {project.description && <p className="text-slate-400 mt-1 text-sm">{project.description}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks section */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-white text-lg">Tasks ({tasks.length})</h2>
            {isAdmin && (
              <Link to={`/tasks?project_id=${id}`} className="btn-primary text-sm py-1.5">
                <Plus size={15} /> Add Task
              </Link>
            )}
          </div>

          {tasks.length === 0 ? (
            <p className="text-slate-500 text-sm">No tasks in this project yet.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{t.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.assignee_name ? `Assigned to ${t.assignee_name}` : 'Unassigned'}
                      {t.due_date && ` · Due ${new Date(t.due_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members section */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-white text-lg">Members ({members.length})</h2>
            {isAdmin && (
              <button onClick={() => setShowAddMember(!showAddMember)} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                <UserPlus size={16} />
              </button>
            )}
          </div>

          {showAddMember && isAdmin && (
            <div className="mb-4 p-3 rounded-xl bg-slate-800/60 space-y-2">
              <select
                className="input text-sm"
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
              >
                <option value="">Select user...</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowAddMember(false)} className="btn-secondary flex-1 justify-center text-sm py-1.5">Cancel</button>
                <button onClick={handleAddMember} className="btn-primary flex-1 justify-center text-sm py-1.5">Add</button>
              </div>
            </div>
          )}

          {members.length === 0 ? (
            <p className="text-slate-500 text-sm">No members yet.</p>
          ) : (
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/40 transition-colors group">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-600/20 flex items-center justify-center text-indigo-300 text-sm font-bold flex-shrink-0">
                    {m.user_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">{m.user_name}</p>
                    <p className="text-xs text-slate-600 capitalize">{m.role}</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-1 rounded-lg text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}