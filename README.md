# InternConnect

> A full-stack internship listing and application platform built with Next.js, Node.js/Express, Prisma, and PostgreSQL — containerized with Docker and deployed to Render via a fully automated Github actions CI/CD pipeline.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Phase 1 — Testing](#phase-1--testing)
- [Phase 2 — Dockerization](#phase-2--dockerization)
- [Phase 3 — Push to Docker Hub](#phase-3--push-to-docker-hub)
- [Phase 4 — Deploy to Render](#phase-4--deploy-to-render)
- [Phase 5 — CI/CD Pipeline](#phase-5--cicd-pipeline)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)

---

## Project Overview

InternConnect is a web application that connects students with employers offering internship opportunities. Students can browse listings, apply with resumes, and track application status. Employers can post listings, review applicants, and manage their pipeline. Admins have full oversight of all users and listings.

**User roles:** Student · Employer · Admin

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, Prisma ORM |
| Database | PostgreSQL 16 |
| Auth | JWT (access + refresh tokens) |
| File Uploads | Multer (resumes, avatars) |
| Containerization | Docker, Docker Compose |
| Registry | Docker Hub |
| Hosting | Render (backend + frontend + database) |
| CI/CD | GitHub Actions |
| Testing | Jest, Supertest (backend) · Jest, React Testing Library (frontend) |

---

## Project Structure

```
DS0101_FinalProject_G6/
├── .github/
│   └── workflows/
│       └── ci-cd.yml               ← GitHub Actions pipeline
├── internconnect_backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── tests/
│   │   ├── setup.js
│   │   ├── unit/
│   │   └── integration/
│   ├── uploads/
│   │   ├── avatars/
│   │   └── resumes/
│   ├── .dockerignore
│   ├── .env                        ← never committed
│   ├── Dockerfile
│   └── package.json
├── InternConnect/
│   ├── app/                        ← Next.js app router pages
│   ├── lib/
│   │   └── api-client.ts           ← centralised API client
│   ├── src/
│   │   └── __tests__/
│   ├── .dockerignore
│   ├── .env.local                  ← local dev env, never committed
│   ├── .env.production             ← production env, baked into image
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.override.yml     ← dev overrides, auto-loaded
└── README.md
```

---

## Phase 1 — Testing

A full test suite was written for both backend and frontend. All tests are fully isolated — no real database or network calls are made. The suite is deterministic and designed to run cleanly in CI.

---

### Backend Tests

**`tests/setup.js`**

Configures the test environment before any test runs. Sets `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV`, and `DATABASE_URL` to safe test values so no real secrets are ever used in the pipeline. Prisma is mocked globally so no database connection is required.

---

**`tests/unit/jwt.test.js`**

Tests the JWT utility functions in isolation — `signAccessToken`, `signRefreshToken`, `verifyAccessToken`, and `verifyRefreshToken`. Covers:

- Valid token signing and verification
- Invalid and tampered tokens
- Cross-token rejection (access token rejected by refresh verifier)
- Wrong secret rejection
- Expired token handling
- Expiration claim verification

---

**`tests/unit/pagination.test.js`**

Tests the `paginate()` utility function. Covers:

- Correct shape and calculated values for standard inputs
- Edge cases: `page=0`, negative page, `limit=0`
- Limit greater than total items
- String inputs coerced to numbers
- Undefined inputs
- Type assertions on all return values

---

**`tests/unit/middleware.test.js`**

Tests `asyncHandler`, `requireRole`, and `authenticate` middleware in isolation. Covers:

- Async error catching and forwarding to Express error handler
- Role blocking and allowing based on JWT payload
- Missing Authorization header
- Malformed Authorization header
- Expired tokens
- Empty Bearer tokens

---

**`tests/integration/health.test.js`**

Tests the `/health` endpoint. Confirms:

- Returns `200 { status: 'ok' }` without authentication
- Timestamp is a valid ISO 8601 string

---

**`tests/integration/auth.routes.test.js`**

Tests all authentication endpoints. Covers:

- Student and employer registration with valid data
- Validation rejection for missing or invalid fields
- Password hashing verification (stored hash never equals plaintext)
- Role-based status assignment (STUDENT → ACTIVE, EMPLOYER → PENDING)
- Duplicate email handling via Prisma `P2002` error code
- Login with correct credentials
- Login with incorrect password
- PENDING account login blocking
- INACTIVE account login blocking
- Refresh token flow — new access token issued
- Logout endpoint

---

**`tests/integration/listing.routes.test.js`**

Tests all listing endpoints. Covers:

- Paginated listing retrieval with correct shape
- Single listing fetch with employer details populated
- View count increment on each fetch
- Listing creation with EMPLOYER token
- Role enforcement — STUDENT cannot create listings
- Past deadline rejection on create
- Ownership check on update — employers can only update their own listings
- Cross-employer blocking on update
- Admin deletion of any listing
- `P2025` not-found error mapping to 404
- Listing close endpoint
- Applicants endpoint with `groupBy` mock

---

**`tests/integration/application.routes.test.js`**

Tests all application endpoints. Covers:

- Submission with STUDENT token
- Multer mocked so no files are written to disk during tests
- Role blocking — EMPLOYER and unauthenticated users cannot submit
- Duplicate application handling via Prisma `P2002`
- snake_case and camelCase field acceptance
- Status update by EMPLOYER and ADMIN
- Withdrawal by STUDENT
- `/check` endpoint for application status lookup

---

**`tests/integration/search.routes.test.js`**

Tests the search endpoints. Covers:

- Full-text search with filters (location, work hours, industry)
- Deadline filter
- Sorting by relevance, date, stipend
- Pagination of search results
- Limit capping at 100
- Empty results shape
- Employer details populated in results
- Safe sort value fallback for invalid sort params
- Suggestions endpoint — deduplication, 5-item limit, empty query validation, query trimming

---

### Frontend Tests

**`src/__tests__/LoginPage.test.tsx`**

Tests the real `LoginPage` component imported directly from the codebase. Covers:

- Form rendering with all expected fields
- Email and password field presence
- Empty form submission validation
- Invalid email format handling
- Role-based redirects — STUDENT → `/dashboard/student`, EMPLOYER → `/dashboard/employer`, ADMIN → `/dashboard/admin`
- Failed login error display with toast notification
- Loading state — inputs disabled and button shows "Signing in..."
- Registration and forgot password links present

---

**`src/__tests__/StatusBadge.test.tsx`**

Tests the real `StatusBadge` component. Covers all 8 status values:

| Status | Label | Color |
|---|---|---|
| `submitted` | Submitted | Blue |
| `under_review` | Under Review | Yellow |
| `accepted` | Accepted | Green |
| `rejected` | Rejected | Red |
| `active` | Active | Green |
| `closed` | Closed | Grey |
| `pending` | Pending | Orange |
| `inactive` | Inactive | Red |

Label text and CSS class assertions for every color mapping including hover variants.

---

**`src/__tests__/ApplicationDetailDrawer.test.tsx`**

Tests the real `ApplicationDetailDrawer` component. Covers:

- Null and closed state rendering (nothing shown)
- Loading spinner during data fetch
- Company name and listing details display
- Work hours and stipend display
- Industry badge display
- `StatusBadge` integration
- Withdraw button visibility based on application status
- Withdraw API call on button click
- Success and error toast notifications
- Drawer closes after successful withdrawal
- Disabled state during withdrawal in progress
- Responsive layout — Sheet on mobile, Drawer on desktop

---

**`src/__tests__/StudentDetailDrawer.test.tsx`**

Tests the real `StudentDetailDrawer` component. Covers:

- Null and closed state rendering
- Loading spinner
- Student profile display — full name, email mailto link, university, course, graduation year
- Avatar fallback with initials
- Skills badges display
- Skills section hidden when skills array is empty
- Bio display and absence handling
- Cover letter with fallback text
- Resume download link
- Resume section hidden when no resume provided
- `StatusBadge` integration
- API call made with correct student ID
- Fallback to prop data on API error
- Fallback to prop data on API exception
- State reset when drawer closes

---

**`src/__tests__/ListingsPage.test.tsx`**

Tests the real `ListingsPage` component. Covers:

- Page heading and subheading render
- Loading spinner during initial fetch
- `getConstants` and `searchListings` called on mount
- Listing card rendering — title, company name, location, work hours, stipend
- Link to listing detail page
- Multiple listings rendered correctly
- Company initials in avatar fallback
- Missing employer data fallback
- Singular and plural results count ("1 internship found" vs "5 internships found")
- Empty state message
- Search input updates query
- Form submission triggers new search
- Autocomplete suggestions appear on input
- Suggestion click populates search field
- Filter headings render
- Clear filters button resets state
- Error message displayed on API failure
- Error message displayed on API exception

---

### Running Tests

```bash
# Backend tests
cd internconnect_backend
npm test

# Frontend tests
cd InternConnect
npm test
```

Backend test results:

![Backend test results](./public/image.png)

Frontend test results:

![Frontend test results](./public/image-1.png)
![Frontend test reults](./public/image-2.png)
---

## Phase 2 — Dockerization

The full application is containerized using Docker with a multi-stage build strategy for both services. Docker Compose orchestrates all three services with separate configurations for production and local development.

---

### Files Created

#### `internconnect_backend/.dockerignore`

Excludes from the backend build context:

```
node_modules              ← rebuilt inside the image via npm ci
npm-debug.log             ← npm debug logs not needed in image
.env                      ← secrets must never enter a Docker layer
.git                      ← git history is large and irrelevant
coverage                  ← test coverage reports
uploads/avatars/*         ← avatar files mounted as a named volume at runtime
uploads/resumes/*         ← resume files mounted as a named volume at runtime
!uploads/avatars/.gitkeep ← keeps the avatars folder structure in the image
!uploads/resumes/.gitkeep ← keeps the resumes folder structure in the image
```

---

#### `internconnect_backend/Dockerfile` — 3-Stage Build

```dockerfile
# ── Stage 1: production dependencies only ────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ── Stage 2: full build — devDependencies needed for prisma generate ──────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

# ── Stage 3: lean production runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# openssl required by Prisma client at runtime
RUN apk add --no-cache openssl

# Copy production node_modules from stage 1
COPY --from=deps    /app/node_modules ./node_modules
# Copy the generated Prisma client (overwrites the stub in node_modules)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Copy source and config
COPY --from=builder /app/src          ./src
COPY --from=builder /app/prisma       ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/uploads      ./uploads

# Run as non-root for security
USER node

EXPOSE 5000
CMD ["node", "src/server.js"]
```

**Why 3 stages:**
- Stage 1 caches production deps separately — rebuilding after source changes skips this stage entirely
- Stage 2 has devDependencies available so `prisma generate` works
- Stage 3 copies only what's needed — the final image has no compiler, no Prisma CLI, no test tools

---

#### `InternConnect/.dockerignore`

```
node_modules
build/
.env
*.log
.git
```

---

#### `InternConnect/Dockerfile` — 2-Stage Build

```dockerfile
# ── Stage 1: build the Next.js app ───────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# ── Stage 2: production runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
USER node
CMD ["npm", "start"]
```

**Why Next.js uses Node, not nginx:** The app has dynamic server-rendered routes (`/listings/[id]`, `/reset-password`, etc.) that require the Next.js server to run. nginx can only serve static files and cannot handle SSR.

**Why `ARG` + `ENV`:** `NEXT_PUBLIC_` variables are baked into the JavaScript bundle at build time, not read at runtime. The `ARG` accepts the value from CI, and `ENV` makes it available to `npm run build`.

**Why `--legacy-peer-deps`:** The project uses React 19 but `@testing-library/react@14` declares a peer dependency on React 18. This flag uses the older npm resolution behaviour to allow the install to proceed.

---

#### `docker-compose.yml`

Defines three services on a shared bridge network for production use:

```yaml
services:
  # ── PostgreSQL database ───────────────────────────────────────────────────
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    env_file:
      - ./internconnect_backend/.env
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  # ── Node.js backend ───────────────────────────────────────────────────────
  backend:
    build: ./internconnect_backend
    restart: unless-stopped
    env_file:
      - ./internconnect_backend/.env
    depends_on:
      db:
        condition: service_started
    networks:
      - app-network
    volumes:
      - uploads_data:/app/uploads
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"]
      interval: 30s
      timeout:  10s
      retries:  3
      start_period: 15s

  # ── Next.js frontend ──────────────────────────────────────────────────────
  frontend:
    build: ./InternConnect
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - app-network

volumes:
  postgres_data:
  uploads_data:

networks:
  app-network:
    driver: bridge
```

**Key decisions:**
- `env_file` loads variables directly into the container — no `${VAR}` interpolation needed in the compose file
- `uploads_data` named volume ensures uploaded avatars and resumes survive `docker compose down`
- `postgres_data` named volume ensures database data survives container restarts
- Frontend waits for backend `service_healthy` before starting, preventing race conditions
- Healthcheck uses `wget` (available on Alpine) to poll `/health` every 30 seconds

---

#### `docker-compose.override.yml`

Auto-loaded by `docker compose up` for local development only. Never used in production or CI.

```yaml
# This file is auto-loaded by `docker compose up` — dev-only overrides.
# Do NOT commit real secrets; keep .env out of git.

services:
  backend:
    volumes:
      # Live-reload: local src changes are reflected immediately
      - ./internconnect_backend/src:/app/src
      # Mount local uploads so avatars/resumes persist without a named volume in dev
      - ./internconnect_backend/uploads:/app/uploads
    ports:
      # Expose backend so you can hit it directly from the browser / Postman
      - "5000:5000"

  db:
    ports:
      # Expose postgres so you can connect with TablePlus / DBeaver / psql
      - "5432:5432"
```

---

### Running with Docker Compose

```bash
# Build and start all services
docker compose up --build

# Start without rebuilding (faster)
docker compose up

# Stop and remove containers (keeps volumes)
docker compose down

# Stop and delete all data (wipes database and uploads)
docker compose down -v
```

| URL | Service |
|---|---|
| `http://localhost:3000` | Next.js frontend |
| `http://localhost:5000/health` | Backend health check |
| `localhost:5432` | PostgreSQL (connect with TablePlus etc.) |

---

## Phase 3 — Push to Docker Hub

Images are tagged with both `:latest` and the git commit SHA for traceability.

```bash
# Log in
docker login
```
```bash
# Build and tag
docker build -t jigden18/internconnect-backend:latest ./internconnect_backend
```
![build backend image](./public/Screenshot%202026-05-23%20212951.png)

```bash
docker build -t jigden18/internconnect-frontend:latest ./InternConnect
```
![alt text](./public/Screenshot%202026-05-23%20215905.png)
```bash
# Push
docker push jigden18/internconnect-backend:latest
docker push jigden18/internconnect-frontend:latest
```
Pushed backend image to registry

![push backend image to registry](./public/Screenshot%202026-05-23%20215807.png)

Pushed frontend image to registry

![push frontend image to registry](./public/Screenshot%202026-05-23%20220418.png)

Images are available at:
- `docker.io/jigden18/internconnect-backend`
- `docker.io/jigden18/internconnect-frontend`


Images pushed to DockerHub

![images pushed to DockerHub](./public/Screenshot%202026-05-23%20220556.png)
---

## Phase 4 — Deploy to Render

### Services Deployed

| Service | Type | Plan | URL |
|---|---|---|---|
| `internconnect-db` | PostgreSQL | Free | — |
| `internconnect-backend` | Web Service | Free | `https://internconnect-backend-uyuc.onrender.com` |
| `internconnect-frontend` | Web Service | Free | `https://internconnect-frontend.onrender.com` |

---

### Step 1 — PostgreSQL on Render

Created a free PostgreSQL instance on Render. Two connection URLs are provided:

- **Internal URL** — used by the backend service inside Render's network (`DATABASE_URL` env var)
- **External URL** — used from a local machine to run migrations and seed

---

### Step 2 — Run Migrations

```bash
DATABASE_URL="<external URL>" npx prisma migrate deploy
```

`migrate deploy` applies existing migrations without prompting. Never use `migrate dev` in production — it can reset the database.

![DB migration](./public/image-3.png)
---

### Step 3 — Seed the Database

```bash
cd internconnect_backend
DATABASE_URL="<external URL>" npx prisma db seed
```

Requires the `"prisma": { "seed": "node prisma/seed.js" }` block in `package.json`.

---

### Backend Environment Variables on Render

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DATABASE_URL` | Internal Database URL from Render |
| `JWT_SECRET` | your JWT secret |
| `JWT_EXPIRES_IN` | `24h` |
| `JWT_REFRESH_SECRET` | your refresh secret |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | frontend Render URL |

### Frontend Environment Variables on Render

| Key | Value |
|---|---|
| `PORT` | `3000` |

> No other runtime env vars needed — `NEXT_PUBLIC_` variables are baked into the image at build time by the CI pipeline.

Deployed services

![backend](./public/Screenshot%202026-05-23%20235912.png)

![frontend](./public/Screenshot%202026-05-24%20003718.png)

---

### Deploy Hooks

Each Render service exposes a deploy hook URL under **Settings → Deploy**. These are stored as GitHub Secrets and called by the CI pipeline to trigger redeployment after a new image is pushed.

---

## Phase 5 — CI/CD Pipeline

### Pipeline Overview

```
git push main
     │
     ▼
GitHub Actions
     ├── test-backend   ── npm ci + npm test
     ├── test-frontend  ── npm ci + npm test + npm run build
     │        (both must pass)
     ▼
build-and-push
     ├── backend  → jigden18/internconnect-backend:latest + :sha
     └── frontend → jigden18/internconnect-frontend:latest + :sha
          (NEXT_PUBLIC_API_BASE_URL baked in via build-arg)
     ▼
security-scan
     ├── Trivy scan backend image
     └── Trivy scan frontend image (HIGH + CRITICAL reported)
     ▼
deploy
     ├── curl POST → RENDER_DEPLOY_HOOK_BACKEND
     └── curl POST → RENDER_DEPLOY_HOOK_FRONTEND
```

---

### Workflow File — `.github/workflows/ci-cd.yml`

#### Job 1 — `test-backend`

Runs on every push and PR to `main`. Sets `working-directory` to `internconnect_backend`, installs dependencies with `npm ci`, and runs the full Jest test suite. Uses npm cache keyed to `package-lock.json` for faster runs.

#### Job 2 — `test-frontend`

Runs in parallel with `test-backend`. Sets `working-directory` to `InternConnect`, installs with `npm ci --legacy-peer-deps` (required for React 19 + testing-library compatibility), runs tests with `--watchAll=false` so Jest exits in CI, then runs `npm run build` as a build sanity check.

#### Job 3 — `build-and-push`

Only runs on direct pushes to `main` (not PRs) and only if both test jobs pass. Steps:

1. Logs in to Docker Hub using `DOCKER_USERNAME` and `DOCKER_PERSONAL_ACCESS_TOKEN` secrets
2. Sets up Docker Buildx (required for GHA cache support)
3. Builds and pushes backend image with `:latest` and `:<git-sha>` tags
4. Builds and pushes frontend image with the same tags, passing `NEXT_PUBLIC_API_BASE_URL` as a build arg so the Render backend URL is baked into the Next.js bundle

GitHub Actions cache (`type=gha`) is used to speed up subsequent builds — unchanged layers are restored from cache.

#### Job 4 — `security-scan`

Runs after `build-and-push`. Uses `aquasecurity/trivy-action` to scan both pushed images for HIGH and CRITICAL CVEs. Reports findings in a table but does not fail the pipeline (`exit-code: 0`). Change to `exit-code: 1` to block deployment on critical vulnerabilities.

#### Job 5 — `deploy`

Runs after the security scan. Makes a `curl POST` to each Render deploy hook URL stored in GitHub Secrets. Render pulls the new `:latest` image and restarts the service automatically.

---

### GitHub Secrets Required

| Secret | Description |
|---|---|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PERSONAL_ACCESS_TOKEN` | Docker Hub access token (not password) |
| `RENDER_DEPLOY_HOOK_BACKEND` | Render deploy hook URL for backend service |
| `RENDER_DEPLOY_HOOK_FRONTEND` | Render deploy hook URL for frontend service |
| `NEXT_PUBLIC_API_BASE_URL` | Full backend API URL including `/api` suffix |

![secrets](./public/image-4.png)
---

### End-to-End Verification Checklist

After every successful pipeline run:

- [ ] All 5 GitHub Actions jobs green 🟢
- [ ] Docker Hub shows new `:latest` and `:<sha>` tags for both images
- [ ] Render backend shows new deploy triggered
- [ ] `https://internconnect-backend-uyuc.onrender.com/health` returns `{ status: 'ok' }`
- [ ] Render frontend shows new deploy triggered
- [ ] Frontend loads and all routes work
- [ ] Network tab shows API calls going to Render backend URL, not `localhost`
- [ ] Student registration, login, and application flow works end to end
- [ ] Employer login, listing creation, and applicant review works end to end

---

## Environment Variables

### Backend — `internconnect_backend/.env`

```env
# Database
DATABASE_URL=postgresql://postgres:<password>@db:5432/internconnect
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<password>
POSTGRES_DB=internconnect

# JWT
JWT_SECRET=<secret>
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=<refresh-secret>
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://internconnect-frontend.onrender.com

# File uploads
UPLOAD_DIR=uploads
MAX_RESUME_SIZE_MB=5
MAX_AVATAR_SIZE_MB=2

# Docker Hub
DOCKER_USERNAME=jigden18
```

### Frontend — `InternConnect/.env.local` (local dev)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### Frontend — `InternConnect/.env.production` (baked into Docker image)

```env
NEXT_PUBLIC_API_BASE_URL=https://internconnect-backend-uyuc.onrender.com/api
```

---

## Running Locally

### Without Docker

```bash
# Terminal 1 — backend
cd internconnect_backend
npm install
npm run dev

# Terminal 2 — frontend
cd InternConnect
npm install
npm run dev
```

### With Docker Compose

```bash
docker compose up --build
```

### Run database migrations

```bash
cd internconnect_backend
npx prisma migrate deploy
```

### Seed the database

```bash
cd internconnect_backend
npx prisma db seed
```
---

# Problems Encountered & Solutions

A log of every significant issue hit during Phases 2–5 and exactly how each was resolved.

---

## Phase 2 — Dockerization


### Problem 1 — Docker Desktop not running

**Error:**
```
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**Cause:** Docker Desktop was installed but not started. The `docker` CLI has nothing to connect to without the engine running in the background.

**Solution:** Opened Docker Desktop from the Start menu and waited for the whale icon in the taskbar to stop animating before running any `docker` commands. Enabled "Start Docker Desktop when you log in" in Settings → General to prevent this in future.

---

### Problem 2 — Environment variables showing as blank

**Error:**
```
level=warning msg="The "POSTGRES_PASSWORD" variable is not set. Defaulting to a blank string."
level=warning msg="The "DATABASE_URL" variable is not set. Defaulting to a blank string."
```

**Cause:** Docker Compose looks for `.env` at the project root by default. The `.env` file was inside `internconnect_backend/` not at the root where `docker-compose.yml` lives. Additionally, `env_file` loads variables into the container at runtime but does not make them available for `${VARIABLE}` interpolation in the compose file itself.

**Solution:** Removed the `environment` blocks from `docker-compose.yml` entirely and relied solely on `env_file` pointing to `./internconnect_backend/.env`. This passes all variables directly into the container without needing interpolation:

```yaml
db:
  env_file:
    - ./internconnect_backend/.env

backend:
  env_file:
    - ./internconnect_backend/.env
```

The healthcheck was updated to use a hardcoded port instead of `${PORT}`:
```yaml
test: ["CMD-SHELL", "wget -qO- http://localhost:5000/health || exit 1"]
```

---

### Problem 3 — `.env` file path typo

**Error:**
```
env file C:\Users\DELL\Desktop\DS0101_FinalProject_G6\interconnect_backend\.env not found
```

**Cause:** The backend folder is named `internconnect_backend` but the compose file had `interconnect_backend` — missing the second `c`.

**Solution:** Found the correct path using:
```bash
find . -name ".env" 2>/dev/null
```
Output confirmed `./internconnect_backend/.env`. Updated both the `env_file` path and the `build` path in `docker-compose.yml`.

---

### Problem 4 — Frontend build failed with peer dependency conflict

**Error:**
```
npm error ERESOLVE could not resolve
npm error While resolving: @testing-library/react@14.3.1
npm error Found: react@19.2.5
npm error peer react@"^18.0.0" from @testing-library/react@14.3.1
```

**Cause:** The project uses React 19 but `@testing-library/react@14` declares a peer dependency on React 18. `npm ci` is strict and refuses to install with this conflict.

**Solution:** Added `--legacy-peer-deps` to the `npm ci` command in the frontend Dockerfile. This uses the older npm resolution behaviour and ignores the peer conflict. It is safe here because `@testing-library/react` is a devDependency only used for tests — it does not affect the production build:

```dockerfile
RUN npm ci --legacy-peer-deps
```

---

### Problem 5 — Frontend used nginx but app is Next.js with dynamic routes

**Error:**
```
failed to calculate checksum of ref: "/app/build": not found
```

**Cause:** The frontend Dockerfile was written for a Create React App setup — it copied `/app/build` into nginx. The project is actually Next.js, which outputs to `/app/.next`, not `/app/build`. Furthermore nginx cannot serve dynamic server-rendered routes like `/listings/[id]` or `/reset-password`.

**Solution:** Replaced the nginx-based Stage 2 with a Node.js runner that starts the Next.js server directly:

```dockerfile
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
USER node
CMD ["npm", "start"]
```

Updated the frontend port in `docker-compose.yml` from `"80:80"` to `"3000:3000"`.

---

### Problem 6 — Backend container crashed with `Cannot find module '/app/src/server.js'`

**Error:**
```
Error: Cannot find module '/app/src/server.js'
```

**Cause:** Two mismatches:
1. The Dockerfile `CMD` was set to `node src/index.js` but the actual entry file is `src/server.js`
2. The `package.json` start script runs `node src/server.js`

**Solution:** Updated the Dockerfile `CMD` to match the actual entry file:
```dockerfile
CMD ["node", "src/server.js"]
```

---

### Problem 7 — Prisma generate failed in builder stage (openssl warning)

**Warning:**
```
prisma:warn Prisma failed to detect the libssl/openssl version to use.
Defaulting to "openssl-1.1.x".
```

**Cause:** The builder stage (`node:20-alpine`) does not have OpenSSL installed, so Prisma cannot detect the version during `prisma generate`.

**Solution:** The warning is non-fatal — `prisma generate` still succeeds and produces the client. OpenSSL is installed in the runner stage where Prisma actually connects to the database at runtime:

```dockerfile
RUN apk add --no-cache openssl
```

---

### Problem 8 — Postgres container crashed with uninitialized database error

**Error:**
```
Error: Database is uninitialized and superuser password is not specified.
You must specify POSTGRES_PASSWORD to a non-empty value.
```

**Cause:** `POSTGRES_PASSWORD` was blank because the `env_file` was not being picked up correctly — either the path was wrong or the `environment` block with `${VAR}` interpolation was overriding `env_file` with blank values.

**Solution:** Removed the `environment` block from the `db` service entirely and relied on `env_file` alone. Postgres reads `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` directly from the env file without needing them redeclared in `environment`.

---

### Problem 9 — `prisma generate` ran in runner stage but Prisma client was missing

**Cause:** The runner stage copied `node_modules` from the deps stage (Stage 1 — production deps only). Stage 1 runs `npm ci --only=production` before `prisma generate` is called, so the generated client in `node_modules/.prisma` from Stage 2 was never copied across.

**Solution:** Added an explicit copy of the generated Prisma client from the builder stage into the runner stage:

```dockerfile
COPY --from=deps    /app/node_modules          ./node_modules
COPY --from=builder /app/node_modules/.prisma  ./node_modules/.prisma
```

This copies production deps from Stage 1 and then overwrites just the `.prisma` folder with the generated client from Stage 2.

---

## Phase 3 — Docker Hub


### Problem 10 — College WiFi blocked database seeding

**Error:**
```
Can't reach database server at `dpg-d88u9cgg4nts73eipjng-a:5432`
```

**Cause:** College WiFi blocks outbound connections on port 5432. The seed command was also using the Internal Database URL (which only works inside Render's network) instead of the External Database URL.

**Solution:**
1. Switched to a phone hotspot to bypass the port block
2. Used the correct External Database URL from Render which includes the full hostname:
```
postgresql://user:password@dpg-xxx.singapore-postgres.render.com/internconnect_db
```

---

## Phase 4 — Render Deployment


### Problem 11 — Frontend calling `localhost:5000` in production

**Error in browser network tab:**
```
Request URL: http://localhost:5000/api/auth/register/student
```

**Cause:** The API base URL was hardcoded in `InternConnect/lib/api-client.ts` with a fallback to `localhost:5000`. In production the environment variable `NEXT_PUBLIC_API_BASE_URL` was not being baked into the image, so the fallback was always used.

**Root cause chain:**
- `NEXT_PUBLIC_` variables in Next.js are compiled into the JavaScript bundle at build time, not read at runtime
- Passing them as Docker `build-args` in CI without `ARG` + `ENV` in the Dockerfile means Next.js never sees them during `npm run build`
- Setting them as Render environment variables has no effect because the build is already done

**Solution:** Two changes:

1. Added `ARG` and `ENV` to the frontend Dockerfile so the build arg is exposed to `npm run build`:
```dockerfile
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
```

2. Created `InternConnect/.env.production` which Next.js loads automatically during production builds:
```env
NEXT_PUBLIC_API_BASE_URL=https://internconnect-backend-uyuc.onrender.com/api
```

The `.env.production` approach is more reliable — it doesn't depend on CI passing the correct build arg.

---

### Problem 12 — API calls returning 404 after URL fix

**Error in browser network tab:**
```
Request URL: https://internconnect-backend-uyuc.onrender.com/auth/register/student
Status: 404 Not Found
```

**Cause:** The `NEXT_PUBLIC_API_BASE_URL` in the CI workflow `build-args` was set to:
```
https://internconnect-backend-uyuc.onrender.com
```
Missing the `/api` suffix. The API client appends `/auth/register/student` to the base URL, producing a path without `/api`. All backend routes are mounted under `/api` in Express, so every request returned 404.

**Solution:** Added `/api` to the end of the URL in both `.env.production` and the CI workflow `build-args`:
```
https://internconnect-backend-uyuc.onrender.com/api
```

---

### Problem 13 — Old Docker image cached in CI — fix not picked up

**Cause:** GitHub Actions caches Docker build layers using `type=gha`. When `.env.production` was added, the `COPY . .` layer was still being served from cache because the cache key hadn't changed, meaning the new file was not included in the built image.

**Solution:** Added `no-cache: true` temporarily to the frontend build step in the CI workflow to force a complete rebuild:

```yaml
- name: Build and push frontend
  uses: docker/build-push-action@v5
  with:
    context: ./InternConnect
    push: true
    no-cache: true
    tags: ...
```

Removed `no-cache: true` after the first clean build to restore caching for subsequent runs.

---

## Phase 5 — CI/CD Pipeline


### Problem 14 — `prisma db seed` failed with missing seed config

**Error:**
```
Error: To configure seeding in your project you need to add a "prisma.seed"
property in your package.json
```

**Cause:** The seed command was defined as `"prisma:seed"` inside the `"scripts"` block in `package.json`. Prisma looks for the seed config in a dedicated `"prisma"` top-level block, not in `"scripts"`.

**Solution:** Added the `"prisma"` block to `package.json`:
```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

---

### Problem 15 — `version` attribute warning in Docker Compose

**Warning:**
```
the attribute `version` is obsolete, it will be ignored
```

**Cause:** Newer versions of Docker Compose (v2+) consider the top-level `version:` field obsolete. It is no longer required and generates a warning on every command.

**Solution:** Removed the `version: "3.9"` line from both `docker-compose.yml` and `docker-compose.override.yml`.