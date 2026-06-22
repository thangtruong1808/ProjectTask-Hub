# ProjectTask Hub

A full-stack **project & task management** application for teams with role-based access (Admin, Project Manager, User). Built as a portfolio-grade demo with real-time notifications, responsive UI, and production-oriented patterns.

**Repository:** [github.com/thangtruong1808/ProjectTask-Hub](https://github.com/thangtruong1808/ProjectTask-Hub)

---

## Overview

ProjectTask Hub helps organizations manage **projects**, **project teams**, and **tasks** in one place:

- **Admins** oversee users, roles, projects, and dashboard metrics.
- **Project Managers (PMs)** manage their projects, add team members, create/assign/delete tasks, and receive status notifications.
- **Users** see assigned tasks, update status, and receive assignment notifications in real time.

The app is **not** a simple personal todo list — it is a multi-project, multi-role collaboration system.

---

## Features

### Authentication & security
- Register, login, logout, JWT access + refresh tokens
- Forgot / reset password flow
- Role-based authorization on API and UI routes
- BCrypt password hashing

### Projects
- PM/Admin CRUD on `/projects` (search, filter, pagination)
- PM sees only owned or assigned projects (not every company project)
- Project team panel: add/remove members with **searchable user picker**
- Member list shows name, **role badge**, and email

### Tasks
- Task list with search, status filter, project filter, sort, pagination
- PM/Admin: create, edit, delete tasks
- PM: assign tasks to project members
- User: status-only updates (name/description read-only)
- Loading spinners for filters, refresh, assign, create, and delete actions

### Notifications (SignalR + polling fallback)
- Task assigned → notify assignee + refresh task list
- Project member added → notify user + refresh project list
- PM notified when user updates task status (In Progress / Completed)
- Notification bell: mark read, delete one, delete all
- `ProjectId` on notifications for project-only events

### Admin
- Dashboard stats and recent assignments
- Users management: search, filter by role, update roles

### UX
- Responsive layout (mobile cards + desktop table)
- Inline spinners on in-progress actions
- Accessible combobox patterns for user search

---

## Tech stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, Redux Toolkit, React Router 7 |
| **Realtime** | SignalR (`@microsoft/signalr`) |
| **Backend** | ASP.NET Core 10 Web API, Dapper, JWT Bearer auth |
| **Database** | MySQL 8 (InnoDB, utf8mb4) |
| **Dev** | `concurrently` — API + frontend in one command |

---

## Project structure

```
ProjectTask-Hub/
├── backend/TodoList.Api/     # ASP.NET Core API, SignalR hub, services, repositories
├── frontend/                 # React SPA (Vite)
├── database/                 # SQL schema + sample seed scripts
├── scripts/                  # Dev helpers (e.g. free-dev-ports)
└── package.json              # Root dev scripts (npm run dev)
```

---

## Prerequisites

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) and npm
- MySQL 8.x (local or hosted, e.g. Hostinger)

**Default dev URLs**

| Service | URL |
|---------|-----|
| API | http://localhost:5181 |
| Swagger | http://localhost:5181/swagger |
| SignalR hub | http://localhost:5181/hubs/notifications |
| Frontend | http://localhost:5173 |

---

## Database setup

Run scripts **in order** against your MySQL database (update `USE` database name if needed):

| Order | Script | Purpose |
|-------|--------|---------|
| 1 | `database/create_todolist_database.sql` | Schema (Users, Projects, Tasks, Notifications, …) |
| 2 | `database/insert_sample_user.sql` | Demo users (Admin, PM, Users) |
| 3 | `database/insert_sample_projects.sql` | Sample projects |
| 4 | `database/insert_sample_project_members.sql` | Project memberships |
| 5 | `database/insert_sample_data.sql` | Sample tasks |

> **Existing database** created before `Notifications.ProjectId` was added: run a one-time `ALTER TABLE` to add `ProjectId` and `FK_Notifications_Project`, or re-run the create script on a fresh database.

---

## Local development

### 1. Backend environment

```bash
cp backend/TodoList.Api/.env.example backend/TodoList.Api/.env
```

Edit `.env` with your MySQL connection string, JWT secret, and CORS origin:

```env
CONNECTION_STRING=Server=...;Port=3306;Database=...;User=...;Password=...;
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-long-random-secret-at-least-32-chars
```

### 2. Frontend environment

```bash
cp frontend/.env.example frontend/.env
```

Default API URL:

```env
VITE_API_URL=http://localhost:5181/api
```

### 3. Install dependencies

```bash
# Root (concurrently)
npm install

# Frontend
npm install --prefix frontend
```

### 4. Run API + frontend

From the repository root:

```bash
npm run dev
```

This frees ports `5181` and `5173` if busy, then starts both services.

**Alternatively:**

```bash
dotnet run --project backend/TodoList.Api --launch-profile http
npm run dev --prefix frontend
```

---

## Demo credentials (seed data)

> Portfolio demo only — **change passwords in production.**

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `thangtruong1808@gmail.com` | `THAN@#wcbcw26Todo=^` |
| **User** | `thangdlk072@gmail.com` | `^Toyocbta2026^&!@#$%` |
| **User** | `thang.truong.swin@gmail.com` | `^Toyocbta2026^&!@#$%` |
| **User** | `thang.truong.aws@gmail.com` | `^Toyocbta2026^&!@#$%` |
| **Project Manager** | `thang.truong.truganina@gmail.com` | `^Toyocbta2026^&!@#$%` |

**Role codes:** `0` = User, `1` = Admin, `2` = ProjectManager

---

## API overview

| Area | Base route | Notes |
|------|------------|-------|
| Auth | `/api/auth` | Login, register, refresh, password reset |
| Users | `/api/users` | Profile, assignable user search (`?search=&limit=`) |
| Projects | `/api/projects` | List, manage CRUD, members, assignable users |
| Tasks | `/api/todos` | CRUD, assign, status update |
| Notifications | `/api/notifications` | List, read, delete |
| Dashboard | `/api/dashboard` | Admin stats |
| SignalR | `/hubs/notifications` | Real-time events (`TaskAssigned`, `ProjectAssigned`, …) |

Interactive docs: **Swagger UI** at `/swagger` (Development).

---

## Suggested demo flow

1. Login as **PM** → filter tasks by project → open **Project team** → search and assign a user.
2. Login as **User** → see new project in filter + notification bell → see assigned tasks refresh live.
3. Login as **PM** → create task → assign to user → user receives notification.
4. Login as **User** → set task status to **In Progress** → PM receives notification.
5. Login as **Admin** → **Users** / **Dashboard** / full project visibility.

---

## Build for production

```bash
# Frontend
npm run build --prefix frontend

# Backend
dotnet publish backend/TodoList.Api -c Release -o ./publish
```

Deploy the API with environment variables from `.env.example`, host the `frontend/dist` static files, and point `VITE_API_URL` at your production API.

---

## Author

**Thang Truong** — Full-stack .NET portfolio project.

---

## License

This project is provided as a portfolio / learning demonstration. Add a license file if you plan to open-source or reuse it commercially.
