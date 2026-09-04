# MyPath Project Setup & Developer Guide

Welcome to the **MyPath** project! This repository consists of a **Node.js Express** backend API, a **Next.js 16** frontend application, and **Docker Compose** configuration for rapid development environment setup.

---

## 📁 Repository Structure

```text
MyPath/
├── backend/                  # Node.js + Express REST API
│   ├── Dockerfile.dev        # Docker development file for backend
│   ├── server.js             # Express application entry point
│   ├── config/               # Database & service configurations
│   ├── routes/               # API routes (auth, careers, majors, scholarships, etc.)
│   ├── seeds/                # Database seed scripts
│   └── package.json          # Node.js backend dependencies & scripts
├── frontend/                 # Next.js 16 App Router UI
│   ├── Dockerfile.dev        # Docker development file for frontend
│   ├── app/                  # Next.js application routes & components
│   └── package.json          # Frontend dependencies & scripts
├── docker-compose.dev.yml    # Docker Compose setup for development
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start with Docker (Recommended)

Running the project with Docker Compose is the easiest way to launch both the backend and frontend simultaneously with environment isolation.

### Prerequisites for Docker
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your machine.

### Docker Commands

#### 1. Start All Services (Backend & Frontend)
Run the following command in the root folder of the project:

```bash
docker compose -f docker-compose.dev.yml up --build
```
> *Note for older Docker CLI versions: use `docker-compose -f docker-compose.dev.yml up --build`*

#### 2. Run Containers in the Background (Detached Mode)
```bash
docker compose -f docker-compose.dev.yml up -d
```

#### 3. View Container Logs
```bash
# View logs from all services
docker compose -f docker-compose.dev.yml logs -f

# View logs for backend only
docker compose -f docker-compose.dev.yml logs -f backend

# View logs for frontend only
docker compose -f docker-compose.dev.yml logs -f frontend
```

#### 4. Stop All Running Containers
```bash
docker compose -f docker-compose.dev.yml down
```

#### Service URLs in Docker Mode
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

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
Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://your_user:your_password@localhost:5432/mypath_db
```

#### Step 4: (Optional) Seed the Database
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
| **Backend** | `http://localhost:5000` | `mypath_backend_dev` | `5000` | `PORT`, `DATABASE_URL`, `NODE_ENV` |

---

## 💡 Troubleshooting & Common Issues

- **Port Conflict (`EADDRINUSE`):**
  Ensure port `3000` or `5000` is not being used by another application on your system before starting.
- **Database Connection Failure:**
  Verify that your PostgreSQL database service is active and the `DATABASE_URL` credential in backend `.env` is correct.
- **Node Modules in Docker:**
  If you install new npm packages, rebuild the Docker containers with `--build` flag:
  `docker compose -f docker-compose.dev.yml up --build`
