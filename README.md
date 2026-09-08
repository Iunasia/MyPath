# MyPath Project Setup & Developer Guide

Welcome to the **MyPath** project! This repository consists of a **Node.js Express** backend API, a **Next.js 16** frontend application, and **Docker Compose** configuration for rapid development environment setup.

---

## 📁 Repository Structure

```text
MyPath/
├── backend/                  # Node.js + Express REST API (TypeScript)
│   ├── Dockerfile.dev        # Docker development file for backend
│   ├── .env.example          # Template for local (non-Docker) backend env
│   ├── src/
│   │   ├── server.ts         # Express application entry point
│   │   ├── config/           # Database (pg Pool) & Passport configuration
│   │   ├── models/           # Data access layer (Career, Major, University, …)
│   │   ├── routes/           # API routes (auth, careers, majors, scholarships, …)
│   │   ├── middleware/       # Auth & admin guards
│   │   └── seeds/            # Database schema + seed script
│   ├── middleware/           # Cross-cutting security middleware (rate limiting)
│   ├── utils/                # Scholarship URL risk checking
│   └── package.json          # Node.js backend dependencies & scripts
├── frontend/                 # Next.js 16 App Router UI
│   ├── Dockerfile.dev        # Docker development file for frontend
│   ├── app/                  # Next.js application routes & components
│   └── package.json          # Frontend dependencies & scripts
├── .env.example              # Template for Docker Compose env
├── docker-compose.dev.yml    # Docker Compose setup (db + backend + frontend)
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start with Docker (Recommended)

Running the project with Docker Compose is the easiest way to launch the database, backend, and frontend together with environment isolation. Three services come up: **db** (PostgreSQL 16), **backend**, and **frontend**.

### Prerequisites for Docker
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your machine.

### Docker Commands

#### 1. Create your environment file
From the root folder, copy the template. Compose picks up `.env` automatically:

```bash
cp .env.example .env
```
> Every variable already has a working development default, so an unedited `.env` boots fine. Fill in `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` only if you need Google sign-in.

#### 2. Start All Services (Database, Backend & Frontend)
```bash
docker compose -f docker-compose.dev.yml up --build
```
> *Note for older Docker CLI versions: use `docker-compose -f docker-compose.dev.yml up --build`*

The backend waits for the database healthcheck to pass before it starts, so the first boot takes a few extra seconds.

#### 3. Create the tables and load sample data
The database starts empty. With the containers running, seed it once from another terminal:

```bash
docker compose -f docker-compose.dev.yml exec backend npm run seed
```
> This creates every table and loads sample records. Re-running it **wipes and reloads** all data.

#### 4. Run Containers in the Background (Detached Mode)
```bash
docker compose -f docker-compose.dev.yml up -d
```

#### 5. View Container Logs
```bash
# View logs from all services
docker compose -f docker-compose.dev.yml logs -f

# View logs for backend only
docker compose -f docker-compose.dev.yml logs -f backend

# View logs for frontend only
docker compose -f docker-compose.dev.yml logs -f frontend

# View logs for the database only
docker compose -f docker-compose.dev.yml logs -f db
```

#### 6. Open a psql shell against the running database
```bash
docker compose -f docker-compose.dev.yml exec db psql -U mypath -d mypath
```

#### 7. Stop All Running Containers
```bash
docker compose -f docker-compose.dev.yml down
```
> Your data survives `down` — it lives in the `pgdata` named volume. To wipe the database completely, use `docker compose -f docker-compose.dev.yml down -v` and seed again.

#### Service URLs in Docker Mode
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **PostgreSQL**: `localhost:5432` (user `mypath`, database `mypath`)

---

## 🛠️ Running Services Locally (Without Docker)

If you prefer to run services natively on your host machine for development or debugging, follow the steps below.

### Prerequisites for Local Setup
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL Database**: Running locally or accessible via network

---

### 🟢 1. Running the Backend

#### Step 1: Navigate to the backend directory
```bash
cd backend
```

#### Step 2: Install dependencies
```bash
npm install
```

#### Step 3: Configure Environment Variables
Copy the template into `backend/.env` and point `DATABASE_URL` at your PostgreSQL instance:

```bash
cp .env.example .env
```

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://your_user:your_password@localhost:5432/mypath
SESSION_SECRET=mypath-dev-secret
FRONTEND_URL=http://localhost:3000
```

#### Step 4: Create Tables & Seed the Database
The seed script creates every table before inserting sample data, so run it at least once against a fresh database:

```bash
npm run seed
```

#### Step 5: Start the Backend Server

- **Development Mode (with auto-reload via nodemon):**
  ```bash
  npm run dev
  ```

- **Production Mode:**
  ```bash
  npm start
  ```

The backend server will start on **[http://localhost:5000](http://localhost:5000)**.

---

### 🔵 2. Running the Frontend

#### Step 1: Navigate to the frontend directory
```bash
cd frontend
```

#### Step 2: Install dependencies
```bash
npm install
```

#### Step 3: Configure Environment Variables
Create a `.env.local` file inside the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### Step 4: Start the Frontend Development Server

- **Development Mode (with Next.js Fast Refresh):**
  ```bash
  npm run dev
  ```

- **Build for Production:**
  ```bash
  npm run build
  ```

- **Run Production Build:**
  ```bash
  npm start
  ```

- **Run Linter:**
  ```bash
  npm run lint
  ```

The frontend application will start on **[http://localhost:3000](http://localhost:3000)**.

---

## 📊 Summary of Ports & Environment Variables

| Service | Local URL | Container Name | Default Port | Main Env Variables |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | `http://localhost:3000` | `mypath_frontend_dev` | `3000` | `NEXT_PUBLIC_API_URL`, `BACKEND_INTERNAL_URL` |
| **Backend** | `http://localhost:5000` | `mypath_backend_dev` | `5000` | `PORT`, `DATABASE_URL`, `NODE_ENV`, `SESSION_SECRET`, `FRONTEND_URL` |
| **Database** | `localhost:5432` | `mypath_db_dev` | `5432` | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` |

Optional variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` (Google sign-in) and `SAFE_BROWSING_API_KEY` (scholarship link risk checks). All are safe to leave blank in development.

---

## 💡 Troubleshooting & Common Issues

- **Port Conflict (`EADDRINUSE`):**
  Ensure ports `3000`, `5000`, and `5432` are not being used by another application on your system before starting. If you already run PostgreSQL locally, set `POSTGRES_PORT` in `.env` to something free like `5433` — this only changes the host port, so the backend container is unaffected.
- **Database Connection Failure:**
  Under Docker, the backend waits for the database healthcheck, so this usually means the seed has not been run yet. Run `docker compose -f docker-compose.dev.yml exec backend npm run seed`. Running natively, verify your PostgreSQL service is active and `DATABASE_URL` in `backend/.env` is correct.
- **`relation "careers" does not exist`:**
  The tables have not been created. The seed script creates the schema — run it as shown in step 3.
- **`@esbuild/linux-x64 could not be found`:**
  The container is holding a stale `node_modules` volume. Recreate it with:
  `docker compose -f docker-compose.dev.yml up -d --renew-anon-volumes backend`
- **Node Modules in Docker:**
  If you install new npm packages, rebuild the containers and refresh the module volume:
  `docker compose -f docker-compose.dev.yml up --build --renew-anon-volumes`
