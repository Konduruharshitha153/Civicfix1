# CivicFix — Installation & Setup Guide

This guide walks you through setting up and running the full-stack **CivicFix** platform locally or via Docker.

---

## 📋 Prerequisites

- **Python**: Version 3.10, 3.11, or 3.12
- **Node.js**: Version 18.x, 20.x, or 22.x (with npm)
- **PostgreSQL**: Version 14+ (Optional for quick local evaluation; auto-fallback to SQLite is supported)
- **Git** (optional)

---

## 🚀 Option 1: Quick Local Setup (Recommended for Development)

### 1. Backend Setup (Flask API)

#### Step 1.1: Open Terminal in the Backend Directory
```powershell
cd CivicFix/backend
```

#### Step 1.2: Create and Activate Virtual Environment
**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**On Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### Step 1.3: Install Python Dependencies
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

#### Step 1.4: Configure Environment (`.env`)
Copy the sample environment file:
```bash
cp .env.example .env
```
Open `.env`. Choose your database:

- **For PostgreSQL:**
  ```ini
  DATABASE_URL=postgresql://postgres:your_password@localhost:5432/civicfix_db
  ```
  *(Ensure you created the database in PostgreSQL: `CREATE DATABASE civicfix_db;`)*

- **For Zero-Config SQLite (Instant evaluation without Postgres setup):**
  ```ini
  DATABASE_URL=sqlite:///civicfix.db
  ```

#### Step 1.5: Seed Sample Data
Populate the database with default departments, categories, demo users, realistic Bengaluru complaints with GPS coordinates, and audit timelines:
```bash
python database/seed.py
```
*(If using PostgreSQL directly via psql, you can also execute `schema.sql` and `seed_data.sql`)*:
```bash
psql -U postgres -d civicfix_db -f database/schema.sql
psql -U postgres -d civicfix_db -f database/seed_data.sql
```

#### Step 1.6: Start Flask Server
```bash
python run.py
```
> The backend server starts at: **`http://127.0.0.1:5000`**  
> Health check: `http://127.0.0.1:5000/api/health`

---

### 2. Frontend Setup (React + Tailwind + Leaflet)

#### Step 2.1: Open a New Terminal in the Frontend Directory
```powershell
cd CivicFix/frontend
```

#### Step 2.2: Install NPM Dependencies
```bash
npm install
```

#### Step 2.3: Start Vite Development Server
```bash
npm run dev
```
> The frontend application starts at: **`http://localhost:5173`**

Open **`http://localhost:5173`** in your browser!

---

## 🐳 Option 2: Docker Compose (All-in-One Containerized)

If you have Docker and Docker Compose installed:

```bash
cd CivicFix
docker-compose up --build
```

This starts:
1. `postgres_db`: PostgreSQL 16 on port `5432` with auto-seeded schema and data
2. `backend`: Python Flask API on port `5000`
3. `frontend`: Nginx serving the built React app on port `3000`

Access the application at: **`http://localhost:3000`**

---

## 🔑 Demo Account Credentials

CivicFix includes pre-seeded demo accounts with complete role configurations. You can also use the **"One-Click Demo Login"** buttons directly on the Login page or the role switcher in the top navigation bar!

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Citizen (Reporter)** | `citizen@civicfix.org` | `Password123!` | File complaints, track status, view notifications |
| **Department Staff** | `staff@civicfix.org` | `Password123!` | Field technician, update work status, view assignments |
| **Administrator** | `admin@civicfix.org` | `Password123!` | Full triage queue, assign technicians, link duplicates |

---

## 🧪 Validating Features

1. **Submit a Complaint (`/submit`)**:
   - Type a title: *"Huge pothole crater near Sony World junction"*
   - Click **"Analyze with AI"**: Observe auto-categorization to *Potholes & Road Cavities* under *Roads Department* with high confidence.
   - Click the OpenStreetMap picker to set coordinates.
   - Notice the **Duplicate Warning**: Because a nearby road damage ticket already exists in Koramangala, the system alerts you with match percentage!
2. **Track a Complaint (`/track`)**:
   - Search for `#CVX-2026-10101` or `#CVX-2026-10201`.
   - Inspect the visual progress stepper and complete audit history trail.
3. **Public Map (`/dashboard`)**:
   - Filter pins by category or status on OpenStreetMap.
4. **Hotspot Analytics (`/hotspots`)**:
   - View recurring complaint clusters and preventive maintenance factor explainability.
5. **Admin Triage (`/admin`)**:
   - Log in as `admin@civicfix.org`.
   - Update statuses (`Submitted` &rarr; `Verified` &rarr; `Assigned` &rarr; `In Progress` &rarr; `Resolved`), assign technicians, and link duplicates.
