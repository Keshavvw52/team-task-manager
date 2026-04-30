import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, FolderKanban, Pencil, Trash2, X, ChevronRight } from 'lucide-react'

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6 fade-in">
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

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [form, setForm] = useState({ title: '', description: '' })
  const [saving, setSaving] = useState(false)

  const isAdmin = user?.role === 'admin'

  const fetchProjects = () => {
    api.get('/projects')
      .then(res => setProjects(res.data))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProjects() }, [])

  const openCreate = () => {
    setEditProject(null)
    setForm({ title: '', description: '' })
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditProject(p)
    setForm({ title: p.title, description: p.description || '' })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    setSaving(true)
    try {
      if (editProject) {
        await api.put(`/projects/${editProject.id}`, form)
        toast.success('Project updated')
      } else {
        await api.post('/projects', form)
        toast.success('Project created')
      }
      setShowModal(false)
      fetchProjects()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project? All tasks will be removed.')) return
    try {
      await api.delete(`/projects/${id}`)
      toast.success('Project deleted')
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch {
      toast.error('Failed to delete project')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-16 text-center">
          <FolderKanban size={40} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">No projects yet.</p>
          {isAdmin && (
            <button onClick={openCreate} className="btn-primary mt-4 mx-auto">
              <Plus size={16} /> Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} className="card p-5 hover:border-slate-700 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-600/20 flex items-center justify-center">
                  <FolderKanban size={18} className="text-indigo-400" />
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-white mb-1">{p.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                {p.description || 'No description provided'}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
                <Link
                  to={`/projects/${p.id}`}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  View details <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editProject ? 'Edit Project' : 'New Project'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Title *</label>
              <input
                className="input"
                placeholder="Project name"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input resize-none h-24"
                placeholder="What is this project about?"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editProject ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}