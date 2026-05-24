# ProManage 🚀
> A modern, premium, and feature-rich Task Management & DevOps Platform built on the MERN stack.

ProManage integrates advanced software project management capabilities like Kanban boards and team collaboration with real-time DevOps insights including CI/CD pipelines monitoring, container status tracking, and deployment logs.

---

## 💎 Features

### 1. Task & Project Management
- **Kanban Board**: Drag-and-drop system (`@hello-pangea/dnd`) for managing tasks across custom columns (Backlog, To-Do, In Progress, Review, Completed).
- **Project Workspaces**: Dedicated workspaces for individual projects with activity logging and task assignments.
- **Collaborative Teams**: Manage project members, roles, and access.

### 2. DevOps & CI/CD Dashboard
- **Pipeline Monitoring**: Real-time mock/simulated CI/CD pipelines showing checkouts, builds, tests, and deployment statuses.
- **Docker Integration**: Live monitoring dashboard for container status (running/stopped), CPU, memory usage, and port mapping.
- **Deployment Logs**: Comprehensive deployment history tracking versions, environments (production, staging, development), and rollbacks.

### 3. Analytics & Admin Insights
- **Recharts Analytics**: Dynamic charts displaying task distribution, project health, and team productivity.
- **Admin Control Panel**: Advanced management board for users, settings, and platform configuration.
- **System Activity Feeds**: Detailed system-wide audit logs showing who performed what action.

### 4. Advanced Security & Auth
- **JWT & Cookie-Based Sessions**: Secure session management.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Admins, Project Managers, and Team Members.
- **Rate-Limiting & Helmet**: Production-ready API protection.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18+ (with TypeScript)
- **Styling**: TailwindCSS, Vanilla CSS
- **Bundler**: Vite
- **Animations**: Framer Motion
- **State/Routing**: React Router DOM (v7)
- **Charts**: Recharts
- **Icons**: Lucide React, React Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT, bcryptjs, cookie-parser
- **Notifications**: Nodemailer (SMTP)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas)

---

### 📂 Repository Structure
```text
ProManage/
├── backend/          # Node.js + Express + Mongoose server
└── frontend/         # React + Vite + TypeScript application
```

---

### 🔧 Installation & Setup

#### Step 1: Clone the Repository
```bash
git clone https://github.com/Prashant9128/ProManage.git
cd ProManage
```

#### Step 2: Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory (or configure the existing one):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/promanage
   JWT_SECRET=promanage_super_secret_key_2026
   JWT_EXPIRE=7d
   COOKIE_EXPIRE=7
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   
   # SMTP Configuration (Optional for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```
4. **Seed the database** (Creates initial users, projects, tasks, and system activities):
   ```bash
   npm run seed
   ```
5. Run the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000`*

---

#### Step 3: Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The client application will start on `http://localhost:5173`*

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user
- `POST /api/auth/login` - Authenticate a user and set cookies
- `POST /api/auth/logout` - Clear user session/cookies
- `GET /api/auth/me` - Get current authenticated user profile

### Projects (`/api/projects`)
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Fetch single project details
- `PUT /api/projects/:id` - Update project details
- `DELETE /api/projects/:id` - Delete a project

### Tasks (`/api/tasks`)
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Edit task (supports category, assignee, and status changes)
- `DELETE /api/tasks/:id` - Delete task

### DevOps/CICD (`/api/cicd`)
- `GET /api/cicd/pipelines` - Retrieve CI/CD pipelines
- `GET /api/cicd/containers` - Get Docker container statistics
- `GET /api/cicd/deployments` - Fetch deployment log/history
- `GET /api/cicd/stats` - Platform health stats

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.