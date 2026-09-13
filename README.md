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
│   │       └── data/         # Source .xlsx workbooks the seed reads
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
> This creates every table and loads data. Re-running it **wipes and reloads** all data.

Scholarship, exchange and internship records are read from the Excel workbooks in
[`backend/src/seeds/data/`](backend/src/seeds/data/) — edit a spreadsheet and re-seed to
change the data, no code change needed. To see what a workbook would produce without
touching the database:

```bash
docker compose -f docker-compose.dev.yml exec backend npm run seed:preview
```

If that directory has no readable workbook, the seed stops before deleting anything.
See the [data README](backend/src/seeds/data/README.md) for the column mapping.

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

## API documentation

- [`backend/docs/API.md`](backend/docs/API.md) — endpoint reference, auth model, DMIL fields, and the current known-issues list.
- [`backend/openapi.yaml`](backend/openapi.yaml) — OpenAPI 3.1 contract. Import it into Postman, Insomnia or Swagger UI.

## Backend tests

```bash
docker compose -f docker-compose.dev.yml exec backend npm test
```

API tests run against their own `mypath_test` database and refuse to run against any database whose name does not end in `_test`, so development data is never touched.

They assert *correct* behaviour, so the known issues listed in the API docs currently show up as failures. That is deliberate — each failure is a bug with a reproduction, and fixing one turns its test green.

> After pulling changes that add a backend dependency, rebuild the image — `node_modules` lives in a Docker volume, not the bind mount:
> ```bash
> docker compose -f docker-compose.dev.yml build backend
> docker compose -f docker-compose.dev.yml up -d --force-recreate --renew-anon-volumes backend
> ```

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
The seed script creates every table before inserting data, so run it at least once against a fresh database. It reads the opportunity records from the Excel workbooks in `backend/src/seeds/data/`:

```bash
npm run seed:preview   # optional — dry run, prints what would be inserted
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

## ☁️ Deploying to Vercel

The frontend and the backend deploy as **two separate Vercel projects** from this
one repository, because Vercel builds a single Root Directory per project.

| Project | Root Directory | Framework preset |
| :--- | :--- | :--- |
| Frontend | `frontend` | Next.js |
| Backend | `backend` | Express |

Both presets are detected automatically — neither project needs a
`vercel.json`. Vercel locates an Express app by looking for `app`, `index` or
`server` at the root or under `src/`, so it picks up
[`backend/src/app.ts`](backend/src/app.ts) and calls its default export for
every request. The whole API becomes one function and Express routes the
original path itself, so `/auth/me`, `/scholarships` and the rest keep the URLs
they already have. Moving or renaming that file breaks the deploy.

### 1. Provision a Postgres database

Vercel functions are stateless and short-lived, so the local Docker Postgres
cannot be used. Any hosted provider works (Neon, Supabase, Vercel Postgres).
**Use the provider's pooled connection string** — Neon's `-pooler` host, or
Supabase's port `6543` — otherwise each cold function opens a fresh connection
and the database hits its connection limit almost immediately.

Then seed it once from your machine:

```bash
cd backend
DATABASE_URL='<pooled connection string>' npm run seed
```

### 2. Set the environment variables

On the **backend** project:

| Variable | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | the pooled connection string |
| `SESSION_SECRET` | a long random string — never the dev default |
| `FRONTEND_URL` | `https://<frontend>.vercel.app` (no trailing slash) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | from Google Cloud, if using Google sign-in |
| `GOOGLE_CALLBACK_URL` | `https://<backend>.vercel.app/auth/google/callback` |

On the **frontend** project:

| Variable | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://<backend>.vercel.app` (no trailing slash) |

Leave `BACKEND_INTERNAL_URL` **unset** on Vercel. It exists only so the frontend
container can reach the backend container over the Compose network; there is no
such private network on Vercel, and
[`api.server.ts`](frontend/app/lib/api.server.ts) already falls back to
`NEXT_PUBLIC_API_URL` when it is absent.

`NODE_ENV=production` is load-bearing: it is what moves sessions into Postgres
and marks the session cookie `SameSite=None; Secure`. Without it the deploy
accepts a login and then immediately reports the user as logged out.

### 3. Register the OAuth redirect URI

In the Google Cloud console, under **APIs & Services → Credentials → your OAuth
2.0 Client ID**, add to **Authorized redirect URIs**:

```text
https://<backend>.vercel.app/auth/google/callback
```

This must be the **backend** origin and must match `GOOGLE_CALLBACK_URL`
character for character — Google rejects the request on any mismatch, including
a trailing slash. **Authorized JavaScript origins** can be left empty: the
frontend starts the flow with a full page navigation to `/auth/google`, not a
browser-side token request, so that field is never consulted.

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
