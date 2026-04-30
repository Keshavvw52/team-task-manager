# Team Task Manager

A small full-stack task manager for teams. It has users, projects, task assignment, status tracking, and a dashboard. Admin users can manage projects, members, and tasks. Member users can work with the tasks assigned to them.

This repo is split into two apps:

- `backend/` - FastAPI, SQLAlchemy, JWT auth
- `frontend/` - React, Vite, Tailwind CSS

## What it does

- Sign up and log in with JWT-based auth
- Create and manage projects
- Add members to projects
- Create tasks with assignees, due dates, priorities, and statuses
- View dashboard stats and recent activity
- Keep admin-only pages away from member users

## Local Setup

You need Python 3.10+ and Node.js 18+.

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000
```

On macOS/Linux, use this instead of the Windows activate/copy commands:

```bash
source venv/bin/activate
cp .env.example .env
```

The API runs at `http://localhost:8000`.
FastAPI docs are available at `http://localhost:8000/docs`.

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

On macOS/Linux:

```bash
cp .env.example .env
```

The frontend runs at `http://localhost:5173`.

## Environment Variables

Backend, in `backend/.env`:

```env
SECRET_KEY=replace_with_a_long_random_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./taskmanager.db
```

Frontend, in `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Do not commit real `.env` files. Keep only the `.env.example` files in git.

## Useful Commands

Frontend:

```bash
npm run dev
npm run build
npm run lint
```

Backend:

```bash
uvicorn main:app --reload --port 8000
```

## Notes Before Pushing

The root `.gitignore` is set up to keep local-only files out of GitHub, including:

- `.env` files
- `node_modules/`
- `dist/`
- `venv/`
- `__pycache__/`
- local SQLite databases
- log files

If you already staged any of those files before adding this ignore file, unstage them before pushing.
