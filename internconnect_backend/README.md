# InternConnect Backend

A REST API for an internship/job platform connecting students with employers.  
Built with **Node.js · Express · Prisma · PostgreSQL**.

---

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** (local install or Docker)

---

## Local Setup — Step by Step

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Fill in your values in .env

# 3. Set up PostgreSQL

# Option A: PostgreSQL installed locally
createdb internconnect

# Option B: Docker (no local PostgreSQL needed)
docker run --name internconnect-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=internconnect \
  -p 5432:5432 -d postgres

# 4. Update DATABASE_URL in .env
# e.g. DATABASE_URL=postgresql://postgres:postgres@localhost:5432/internconnect

# 5. Run Prisma migration
npm run prisma:migrate
# When prompted, name it: init

# 6. Generate Prisma client
npm run prisma:generate

# 7. Seed the database
npm run prisma:seed

# 8. Start dev server
npm run dev
# Runs at http://localhost:5000
```

---

## File Uploads

Uploaded files are stored locally in the `uploads/` directory and served as static files by the backend.  
The frontend receives full, clickable URLs like:

```
http://localhost:5000/uploads/resumes/filename.pdf
http://localhost:5000/uploads/avatars/filename.jpg
```

No cloud storage account needed.

---

## Testing the API

### Seeded credentials

| Role     | Email                       | Password     |
|----------|-----------------------------|--------------|
| Admin    | admin@internconnect.com     | Admin1234!   |
| Student  | student1@test.com           | Student1234! |
| Student  | student2@test.com           | Student1234! |
| Employer | employer1@test.com          | Employer1234!|
| Employer | employer2@test.com          | Employer1234!|

### Login flow

```bash
# 1. Get a token
POST /api/auth/login
{ "email": "admin@internconnect.com", "password": "Admin1234!" }

# 2. Use the token on protected routes
Authorization: Bearer <token>
```

---

## API Endpoints

### Auth

| Method | Endpoint                        | Auth     | Description                        |
|--------|---------------------------------|----------|------------------------------------|
| POST   | `/api/auth/register/student`    | None     | Register student account           |
| POST   | `/api/auth/register/employer`   | None     | Register employer (pending approval)|
| POST   | `/api/auth/login`               | None     | Login — returns JWT                |
| POST   | `/api/auth/logout`              | Bearer   | Logout                             |
| POST   | `/api/auth/refresh-token`       | None     | Get new access token               |

### Users

| Method | Endpoint                        | Auth     | Description                        |
|--------|---------------------------------|----------|------------------------------------|
| GET    | `/api/users/:id`                | Bearer   | Get user profile                   |
| PUT    | `/api/users/:id`                | Bearer   | Update profile (own only)          |
| POST   | `/api/users/:id/avatar`         | Bearer   | Upload avatar/logo (own only)      |
| DELETE | `/api/users/:id`                | Bearer   | Soft-delete account (INACTIVE)     |
| POST   | `/api/users/:id/change-password`| Bearer   | Change password (own only)         |

### Listings

| Method | Endpoint                        | Auth               | Description                        |
|--------|---------------------------------|--------------------|-------------------------------------|
| GET    | `/api/listings`                 | None               | Browse listings (filter + paginate) |
| GET    | `/api/listings/:id`             | None               | Get listing details                 |
| GET    | `/api/listings/:id/related`     | None               | Get 5 related listings              |
| GET    | `/api/listings/:id/applicants`  | Employer / Admin   | See all applicants                  |
| POST   | `/api/listings`                 | Employer           | Create listing                      |
| PUT    | `/api/listings/:id`             | Employer           | Edit own listing                    |
| PUT    | `/api/listings/:id/close`       | Employer           | Close listing                       |
| DELETE | `/api/listings/:id`             | Employer / Admin   | Delete listing                      |

**Browse query params:** `page`, `limit`, `location`, `jobField`, `workHours`, `search`, `sort` (`postedDate`|`deadline`), `order` (`asc`|`desc`)

### Applications

| Method | Endpoint                        | Auth               | Description                         |
|--------|---------------------------------|--------------------|--------------------------------------|
| POST   | `/api/applications`             | Student            | Submit application + resume upload   |
| GET    | `/api/applications`             | Bearer             | Get applications (filtered by role)  |
| GET    | `/api/applications/:id`         | Bearer             | Get application details              |
| PUT    | `/api/applications/:id/status`  | Employer / Admin   | Update application status            |
| DELETE | `/api/applications/:id`         | Student            | Withdraw application (SUBMITTED only)|

### Search

| Method | Endpoint                        | Auth | Description                              |
|--------|---------------------------------|------|------------------------------------------|
| POST   | `/api/search/listings`          | None | Advanced search with filters + pagination|
| GET    | `/api/search/suggestions?q=...` | None | Autocomplete — up to 5 title suggestions |

**Search body:**
```json
{
  "q": "software engineer",
  "filters": {
    "location": ["San Francisco, CA"],
    "jobField": ["Technology"],
    "workHours": ["Full-time"],
    "deadline_after": "2026-06-01"
  },
  "sort": "postedDate",
  "order": "desc",
  "page": 1,
  "limit": 20
}
```

### Admin *(all require ADMIN role)*

| Method | Endpoint                            | Description                     |
|--------|-------------------------------------|---------------------------------|
| GET    | `/api/admin/users`                  | List all users (paginated)      |
| GET    | `/api/admin/employers/pending`      | List pending employer approvals |
| PUT    | `/api/admin/employers/:id/approve`  | Approve employer                |
| PUT    | `/api/admin/employers/:id/reject`   | Reject employer                 |
| PUT    | `/api/admin/users/:id/deactivate`   | Deactivate user                 |
| PUT    | `/api/admin/users/:id/reactivate`   | Reactivate user                 |
| GET    | `/api/admin/analytics`              | Platform analytics              |
| GET    | `/api/admin/audit-logs`             | Action audit trail              |

---

## Prisma Studio

Visual database browser — view and edit data directly:

```bash
npm run prisma:studio
# Opens at http://localhost:5555
```

---

## Project Structure

```
InternConnect_Backend/
├── prisma/
│   ├── schema.prisma       # Database models & enums
│   └── seed.js             # Seed script (admin + students + employers + listings + applications)
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── listing.controller.js
│   │   ├── application.controller.js
│   │   ├── admin.controller.js
│   │   └── search.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT verification → req.user
│   │   ├── role.middleware.js    # requireRole(...roles)
│   │   ├── upload.middleware.js  # Multer local disk storage
│   │   └── error.middleware.js   # Global error handler + asyncHandler
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── listing.routes.js
│   │   ├── application.routes.js
│   │   ├── admin.routes.js
│   │   └── search.routes.js
│   ├── utils/
│   │   ├── jwt.js              # signAccessToken, signRefreshToken, verify*
│   │   ├── pagination.js       # paginate(page, limit, total)
│   │   └── prisma.js           # PrismaClient singleton
│   └── app.js                  # Express entry point
├── uploads/
│   ├── resumes/                # PDF resumes (local)
│   └── avatars/                # Profile images (local)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Role-Based Access Control

| Endpoint                    | STUDENT | EMPLOYER    | ADMIN |
|-----------------------------|---------|-------------|-------|
| Browse listings             | ✓       | ✓           | ✓     |
| Create listing              | ✗       | ✓           | ✓     |
| Edit / close own listing    | ✗       | ✓ (own)     | ✓     |
| Delete listing              | ✗       | ✓ (own)     | ✓     |
| Submit application          | ✓       | ✗           | ✗     |
| View applications           | ✓ (own) | ✓ (own listings) | ✓ |
| Update application status   | ✗       | ✓ (own listings) | ✓ |
| Withdraw application        | ✓ (own) | ✗           | ✗     |
| Admin panel                 | ✗       | ✗           | ✓     |

---

## Standard Error Format

All errors return:

```json
{
  "status": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Description of the error",
    "details": []
  }
}
```

Common codes: `UNAUTHORIZED` · `FORBIDDEN` · `NOT_FOUND` · `DUPLICATE_ENTRY` · `VALIDATION_ERROR` · `UPLOAD_ERROR` · `INVALID_ACTION`
