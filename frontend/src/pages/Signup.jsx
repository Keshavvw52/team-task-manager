import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, User, Shield, ArrowRight } from 'lucide-react'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await signup(form.name, form.email, form.password, form.role)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="section-label mb-5 inline-block">Task Manager</Link>
          <h1 className="font-display text-4xl text-editorial-foreground mb-3">Create account</h1>
          <p className="text-editorial-subtle text-sm">Begin with a focused workspace for your team.</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-editorial-subtle" />
                <input
                  type="text"
                  className="input pl-9"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-editorial-subtle" />
                <input
                  type="email"
                  className="input pl-9"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-editorial-subtle" />
                <input
                  type="password"
                  className="input pl-9"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Role</label>
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-editorial-subtle" />
                <select
                  className="input pl-9 appearance-none cursor-pointer"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-editorial-subtle mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-editorial-accent hover:text-editorial-accentLight transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
