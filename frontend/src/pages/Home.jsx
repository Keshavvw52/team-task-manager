import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, FolderKanban, Users } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-8">
      <nav className="mx-auto flex max-w-5xl items-center justify-between border-b border-editorial-border pb-5">
        <Link to="/" className="font-display text-2xl font-semibold text-editorial-foreground">
          Task Manager
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold tracking-[0.05em] text-editorial-subtle hover:text-editorial-foreground">
            Sign in
          </Link>
          <Link to="/signup" className="btn-primary">
            Start
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-5xl gap-12 py-24 lg:grid-cols-[1.2fr_0.8fr] lg:py-32">
        <div>
          <p className="section-label mb-5">Team planning with restraint</p>
          <h1 className="font-display text-[3rem] font-semibold leading-[1.05] text-editorial-foreground md:text-7xl">
            A calmer way to organize work.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 tracking-[0.01em] text-editorial-subtle">
            Create projects, assign responsibilities, and keep progress visible without turning your workspace into noise.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup" className="btn-primary justify-center">
              Create workspace <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary justify-center">
              Open existing workspace
            </Link>
          </div>
        </div>

        <div className="card border-t-2 border-t-editorial-accent p-8">
          <p className="section-label mb-8">What it keeps clear</p>
          <div className="space-y-7">
            {[
              [FolderKanban, 'Projects', 'A dedicated place for every initiative and its context.'],
              [CheckCircle2, 'Tasks', 'Simple priorities, due dates, owners, and status updates.'],
              [Users, 'Teams', 'Admins and members each get the tools they need.'],
            ].map(([Icon, title, copy]) => (
              <div key={title} className="border-t border-editorial-border pt-5 first:border-t-0 first:pt-0">
                <div className="mb-3 flex items-center gap-3">
                  <Icon size={18} className="text-editorial-accent" />
                  <h2 className="font-display text-xl font-semibold text-editorial-foreground">{title}</h2>
                </div>
                <p className="text-sm leading-6 text-editorial-subtle">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
