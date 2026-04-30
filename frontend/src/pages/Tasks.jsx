import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, X, Pencil, Trash2, Filter, Search, CheckSquare } from 'lucide-react'

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
  return <span className={`w-2 h-2 rounded-full inline-block flex-shrink-0 mt-1.5 ${colors[priority] || 'bg-slate-400'}`} />
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg p-6 fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-white text-lg">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const STATUSES = ['Todo', 'In Progress', 'Completed', 'Overdue']
const PRIORITIES = ['Low', 'Medium', 'High']

export default function Tasks() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const defaultProjectId = searchParams.get('project_id') || ''

  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  const isAdmin = user?.role === 'admin'

  const emptyForm = {
    title: '', description: '', project_id: defaultProjectId,
    assigned_to: '', due_date: '', priority: 'Medium', status: 'Todo'
  }
  const [form, setForm] = useState(emptyForm)

  const fetchTasks = () => {
    api.get('/tasks')
      .then(res => setTasks(res.data))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTasks()
    api.get('/projects').then(res => setProjects(res.data)).catch(() => {})
    if (isAdmin) api.get('/users').then(res => setUsers(res.data)).catch(() => {})
  }, [])

  const openCreate = () => {
    setEditTask(null)
    setForm({ ...emptyForm, project_id: defaultProjectId })
    setShowModal(true)
  }

  const openEdit = (t) => {
    setEditTask(t)
    setForm({
      title: t.title,
      description: t.description || '',
      project_id: t.project_id,
      assigned_to: t.assigned_to || '',
      due_date: t.due_date || '',
      priority: t.priority,
      status: t.status
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    if (isAdmin && !form.project_id) return toast.error('Select a project')
    setSaving(true)
    try {
      const payload = {
        ...form,
        project_id: parseInt(form.project_id),
        assigned_to: form.assigned_to ? parseInt(form.assigned_to) : null,
        due_date: form.due_date || null,
      }
      if (editTask) {
        await api.put(`/tasks/${editTask.id}`, payload)
        toast.success('Task updated')
      } else {
        await api.post('/tasks', payload)
        toast.success('Task created')
      }
      setShowModal(false)
      fetchTasks()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Task deleted')
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleStatusChange = async (task, newStatus) => {
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus })
      toast.success('Status updated')
      fetchTasks()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.project_title?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || t.status === filterStatus
    const matchPriority = !filterPriority || t.priority === filterPriority
    return matchSearch && matchStatus && matchPriority
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Tasks</h1>
          <p className="text-slate-400 mt-1 text-sm">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={18} /> New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-9 text-sm"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input w-auto text-sm" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priority</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <CheckSquare size={40} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">No tasks found.</p>
          {isAdmin && (
            <button onClick={openCreate} className="btn-primary mt-4 mx-auto">
              <Plus size={16} /> Create a task
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/60">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Task</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Project</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Assignee</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Due</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Priority</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-start gap-2">
                      <PriorityDot priority={t.priority} />
                      <div>
                        <p className="text-sm font-medium text-slate-200">{t.title}</p>
                        {t.description && <p className="text-xs text-slate-600 truncate max-w-48">{t.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-slate-400">{t.project_title || '—'}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-sm text-slate-400">{t.assignee_name || 'Unassigned'}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className={`text-sm ${t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Completed' ? 'text-red-400' : 'text-slate-400'}`}>
                      {t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium ${t.priority === 'High' ? 'text-red-400' : t.priority === 'Medium' ? 'text-amber-400' : 'text-slate-400'}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {isAdmin ? (
                      <select
                        className="bg-transparent text-sm border-0 outline-none cursor-pointer"
                        value={t.status}
                        onChange={e => handleStatusChange(t, e.target.value)}
                      >
                        {STATUSES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                      </select>
                    ) : (
                      <select
                        className="bg-transparent text-sm border-0 outline-none cursor-pointer"
                        value={t.status}
                        onChange={e => handleStatusChange(t, e.target.value)}
                      >
                        {STATUSES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && isAdmin && (
        <Modal title={editTask ? 'Edit Task' : 'New Task'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Title *</label>
              <input className="input" placeholder="Task title" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input resize-none h-20" placeholder="Task description..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Project *</label>
                <select className="input" value={form.project_id}
                  onChange={e => setForm({ ...form, project_id: e.target.value })} required>
                  <option value="">Select project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Assign To</label>
                <select className="input" value={form.assigned_to}
                  onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Due Date</label>
                <input type="date" className="input" value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <div>
                <label className="label">Priority</label>
                <select className="input" value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editTask ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}