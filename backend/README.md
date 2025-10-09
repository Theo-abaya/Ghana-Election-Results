# ⚙️ Election Hub - Backend

RESTful API backend for the Ghana Election Results Management System built with Express.js, Prisma, and PostgreSQL.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start development server
pnpm dev

# Start production server
pnpm start
```

## 📦 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18
- **Language:** TypeScript 5.3
- **Database:** PostgreSQL 13+
- **ORM:** Prisma 5.19
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcryptjs
- **Validation:** Express Validator
- **CORS:** cors middleware
- **Environment:** dotenv

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding script
│   ├── migrations/            # Database migrations
│   └── data/                  # Seed data (JSON files)
│       ├── parties.json       # Political parties
│       └── constituencies.json # All 275 constituencies
├── src/
│   ├── controllers/           # Route controllers
│   │   ├── authController.ts
│   │   ├── adminController.ts
│   │   ├── candidateController.ts
│   │   ├── partyController.ts
│   │   ├── constituencyController.ts
│   │   ├── pollingStationController.ts
│   │   ├── resultController.ts
│   │   └── regionController.ts
│   ├── routes/                # API routes
│   │   ├── authRoutes.ts
│   │   ├── adminRoutes.ts
│   │   ├── candidateRoutes.ts
│   │   ├── partyRoutes.ts
│   │   ├── constituencyRoutes.ts
│   │   ├── pollingStationRoutes.ts
│   │   ├── resultRoutes.ts
│   │   └── regionRoutes.ts
│   ├── middlewares/           # Express middlewares
│   │   ├── authMiddleware.ts  # JWT authentication
│   │   ├── errorHandler.ts    # Error handling
│   │   └── validation.ts      # Input validation
│   ├── utils/                 # Utility functions
│   │   ├── prisma.ts         # Prisma client
│   │   └── jwt.ts            # JWT helpers
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── .env.example              # Environment variables template
├── tsconfig.json             # TypeScript configuration
└── package.json
```

## 🗄️ Database Schema

### Core Entities

**User**

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role     @default(POLLING_OFFICER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  results   Result[]
  auditLogs AuditLog[]
}
```

**Party**

```prisma
model Party {
  id           String      @id @default(uuid())
  name         String      @unique
  abbreviation String      @unique
  color        String
  logoUrl      String?
  candidates   Candidate[]
}
```

**Constituency**

```prisma
model Constituency {
  id              String           @id @default(uuid())
  name            String           @unique
  region          Region
  pollingStations PollingStation[]
  candidates      Candidate[]
}
```

**Candidate**

```prisma
model Candidate {
  id             String        @id @default(uuid())
  name           String
  type           CandidateType
  constituencyId String?
  partyId        String

  party        Party         @relation(...)
  constituency Constituency? @relation(...)
  results      Result[]
}
```

**PollingStation**

```prisma
model PollingStation {
  id               String  @id @default(uuid())
  name             String
  code             String  @unique
  location         String?
  registeredVoters Int     @default(0)
  rejectedVotes    Int     @default(0)
  constituencyId   String

  constituency Constituency @relation(...)
  results      Result[]
}
```

**Result**

```prisma
model Result {
  id               String   @id @default(uuid())
  candidateId      String
  pollingStationId String
  userId           String
  votes            Int
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  candidate      Candidate      @relation(...)
  pollingStation PollingStation @relation(...)
  user           User           @relation(...)

  @@unique([candidateId, pollingStationId])
}
```

**AuditLog**

```prisma
model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  action    String
  details   String   @db.Text
  createdAt DateTime @default(now())

  user User @relation(...)
}
```

**SystemSettings**

```prisma
model SystemSettings {
  id                     String   @id @default(uuid())
  allowResultSubmission  Boolean  @default(true)
  requireApproval        Boolean  @default(false)
  enableNotifications    Boolean  @default(true)
  maintenanceMode        Boolean  @default(false)
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}
```

### Enums

```prisma
enum Role {
  ADMIN
  POLLING_OFFICER
  VIEWER
}

enum CandidateType {
  PRESIDENTIAL
  PARLIAMENTARY
}

enum Region {
  GREATER_ACCRA
  ASHANTI
  NORTHERN
  WESTERN
  EASTERN
  CENTRAL
  VOLTA
  UPPER_EAST
  UPPER_WEST
  SAVANNAH
  BONO
  BONO_EAST
  AHAFO
  WESTERN_NORTH
  OTI
  NORTH_EAST
}
```

## 🔐 Authentication

### JWT Token Structure

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "ADMIN",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Protected Routes

All routes require authentication except:

- `POST /api/auth/login`
- `POST /api/auth/register` (development only)
- `GET /api/results/*` (public results)
- `GET /api/regions`
- `GET /api/constituencies`
- `GET /api/parties`
- `GET /api/candidates/*`

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint           | Description       | Auth | Role |
| ------ | ------------------ | ----------------- | ---- | ---- |
| POST   | `/login`           | User login        | ❌   | -    |
| POST   | `/register`        | Register new user | ❌   | -    |
| GET    | `/me`              | Get current user  | ✅   | All  |
| POST   | `/change-password` | Change password   | ✅   | All  |
| POST   | `/logout`          | User logout       | ✅   | All  |

**Login Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Login Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "ADMIN"
  }
}
```

### Results (`/api/results`)

| Method | Endpoint                         | Description                    | Auth | Role                   |
| ------ | -------------------------------- | ------------------------------ | ---- | ---------------------- |
| GET    | `/presidential`                  | Get presidential results       | ❌   | -                      |
| GET    | `/parliamentary`                 | Get parliamentary results      | ❌   | -                      |
| GET    | `/parliamentary/:constituencyId` | Get constituency results       | ❌   | -                      |
| GET    | `/region/:region`                | Get regional results           | ❌   | -                      |
| POST   | `/submit`                        | Submit polling station results | ✅   | POLLING_OFFICER, ADMIN |
| GET    | `/polling-station/:code`         | Get results by station         | ✅   | All                    |

**Submit Result Request:**

```json
{
  "pollingStationCode": "PS-001-GA",
  "results": [
    {
      "candidateId": "uuid",
      "votes": 250
    },
    {
      "candidateId": "uuid",
      "votes": 180
    }
  ],
  "rejectedVotes": 5
}
```

### Candidates (`/api/candidates`)

| Method | Endpoint                         | Description                  | Auth | Role |
| ------ | -------------------------------- | ---------------------------- | ---- | ---- |
| GET    | `/`                              | Get all candidates           | ❌   | -    |
| GET    | `/presidential`                  | Get presidential candidates  | ❌   | -    |
| GET    | `/parliamentary/:constituencyId` | Get parliamentary candidates | ❌   | -    |
| GET    | `/:id`                           | Get candidate by ID          | ❌   | -    |

### Parties (`/api/parties`)

| Method | Endpoint | Description     | Auth | Role |
| ------ | -------- | --------------- | ---- | ---- |
| GET    | `/`      | Get all parties | ❌   | -    |
| GET    | `/:id`   | Get party by ID | ❌   | -    |

### Constituencies (`/api/constituencies`)

| Method | Endpoint          | Description                  | Auth | Role |
| ------ | ----------------- | ---------------------------- | ---- | ---- |
| GET    | `/`               | Get all constituencies       | ❌   | -    |
| GET    | `/region/:region` | Get constituencies by region | ❌   | -    |
| GET    | `/:id`            | Get constituency by ID       | ❌   | -    |

### Regions (`/api/regions`)

| Method | Endpoint         | Description           | Auth | Role |
| ------ | ---------------- | --------------------- | ---- | ---- |
| GET    | `/`              | Get all regions       | ❌   | -    |
| GET    | `/:region/stats` | Get region statistics | ❌   | -    |

### Polling Stations (`/api/polling-stations`)

| Method | Endpoint                        | Description                  | Auth | Role |
| ------ | ------------------------------- | ---------------------------- | ---- | ---- |
| GET    | `/`                             | Get all polling stations     | ✅   | All  |
| GET    | `/constituency/:constituencyId` | Get stations by constituency | ✅   | All  |
| GET    | `/:code`                        | Get station by code          | ✅   | All  |

### Admin Routes (`/api/admin`)

| Method | Endpoint                | Description                | Auth | Role  |
| ------ | ----------------------- | -------------------------- | ---- | ----- |
| GET    | `/users`                | Get all users              | ✅   | ADMIN |
| POST   | `/users`                | Create new user            | ✅   | ADMIN |
| DELETE | `/users/:id`            | Delete user                | ✅   | ADMIN |
| GET    | `/candidates`           | Get all candidates (admin) | ✅   | ADMIN |
| POST   | `/candidates`           | Create candidate           | ✅   | ADMIN |
| PUT    | `/candidates/:id`       | Update candidate           | ✅   | ADMIN |
| DELETE | `/candidates/:id`       | Delete candidate           | ✅   | ADMIN |
| GET    | `/parties`              | Get all parties (admin)    | ✅   | ADMIN |
| POST   | `/parties`              | Create party               | ✅   | ADMIN |
| PUT    | `/parties/:id`          | Update party               | ✅   | ADMIN |
| DELETE | `/parties/:id`          | Delete party               | ✅   | ADMIN |
| GET    | `/polling-stations`     | Get all stations (admin)   | ✅   | ADMIN |
| POST   | `/polling-stations`     | Create polling station     | ✅   | ADMIN |
| PUT    | `/polling-stations/:id` | Update polling station     | ✅   | ADMIN |
| DELETE | `/polling-stations/:id` | Delete polling station     | ✅   | ADMIN |
| GET    | `/audit-logs`           | Get audit logs             | ✅   | ADMIN |
| GET    | `/stats`                | Get dashboard statistics   | ✅   | ADMIN |
| GET    | `/settings`             | Get system settings        | ✅   | ADMIN |
| PUT    | `/settings`             | Update system settings     | ✅   | ADMIN |
| GET    | `/export`               | Export data (CSV/JSON)     | ✅   | ADMIN |

**Create User Request:**

```json
{
  "email": "officer@example.com",
  "password": "SecurePass123",
  "role": "POLLING_OFFICER"
}
```

**Dashboard Stats Response:**

```json
{
  "totalUsers": 150,
  "totalPollingStations": 40000,
  "totalCandidates": 350,
  "totalResults": 125000,
  "presidentialCandidates": 8,
  "parliamentaryCandidates": 342,
  "resultsSubmittedToday": 1200
}
```

## ⚙️ Environment Variables

Create `.env` file in the backend root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/election_hub"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"

# Server
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:5173"

# Optional: Email configuration (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 🗃️ Database Setup

### PostgreSQL Installation

**macOS:**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### Create Database

```bash
# Access PostgreSQL
psql postgres

# Create database
CREATE DATABASE election_hub;

# Create user (optional)
CREATE USER election_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE election_hub TO election_user;
```

### Run Migrations

```bash
# Create and run migrations
npx prisma migrate dev --name init

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

### Seed Database

```bash
# Seed with initial data
npx prisma db seed

# This creates:
# - Admin user (admin@electionhub.gh / Admin@123)
# - Sample polling officer
# - All 16 regions
# - All 275 constituencies
# - Major political parties (NPP, NDC, etc.)
# - Sample candidates
```

## 🔒 Middleware

### Authentication Middleware (`authMiddleware.ts`)

Validates JWT token and attaches user to request:

```typescript
import { authenticate } from "../middlewares/authMiddleware";

router.get("/protected", authenticate, (req, res) => {
  // req.user contains authenticated user
  res.json({ user: req.user });
});
```

### Role-Based Authorization

```typescript
import { authenticate, authorize } from "../middlewares/authMiddleware";

// Admin only
router.delete("/users/:id", authenticate, authorize(["ADMIN"]), deleteUser);

// Admin or Polling Officer
router.post(
  "/results/submit",
  authenticate,
  authorize(["ADMIN", "POLLING_OFFICER"]),
  submitResult
);
```

### Error Handler (`errorHandler.ts`)

Centralized error handling:

```typescript
// Usage in controllers
throw new Error("Resource not found"); // 500
throw { status: 404, message: "Not found" }; // Custom error
```

### Validation Middleware (`validation.ts`)

Express Validator for input validation:

```typescript
import { body } from "express-validator";
import { validate } from "../middlewares/validation";

router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 8 })],
  validate,
  loginController
);
```

## 📊 Audit Logging

All critical actions are logged automatically:

```typescript
// Automatically logged actions:
- User login/logout
- User creation/deletion
- Result submission
- Candidate CRUD
- Party CRUD
- System settings changes

// Log structure:
{
  "userId": "uuid",
  "action": "CREATE_CANDIDATE",
  "details": "Created presidential candidate: John Doe (NPP)",
  "createdAt": "2024-12-07T10:30:00Z"
}
```

## 📈 Performance Optimization

### Database Indexing

Key indexes for performance:

- `User.email` (unique)
- `PollingStation.code` (unique)
- `Result.candidateId` + `Result.pollingStationId` (composite unique)
- `Constituency.region`
- `Candidate.type` + `Candidate.constituencyId`

### Query Optimization

```typescript
// Include related data in single query
const results = await prisma.result.findMany({
  include: {
    candidate: {
      include: {
        party: true,
      },
    },
    pollingStation: true,
  },
});
```

### Caching Strategy

Consider implementing:

- Redis for frequently accessed data (results, candidates)
- Cache invalidation on data updates
- Response caching for public endpoints

## 🧪 Testing

### Run Tests

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# Coverage report
pnpm test:coverage
```

### Test Structure

```
backend/
├── tests/
│   ├── unit/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── results.test.ts
│   │   └── admin.test.ts
│   └── setup.ts
```

## 🚀 Deployment

### Production Build

```bash
# Build TypeScript
pnpm build

# Output in dist/
```

### Environment Variables in Production

```env
DATABASE_URL="postgresql://user:pass@prod-db:5432/election_hub"
JWT_SECRET="production-secret-key-very-secure"
NODE_ENV="production"
PORT=5000
FRONTEND_URL="https://electionhub.gh"
```

### Deployment Platforms

**Railway:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

**Heroku:**

```bash
# Create app
heroku create election-hub-api

# Set environment variables
heroku config:set DATABASE_URL=...
heroku config:set JWT_SECRET=...

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

**Docker:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Database Backup

```bash
# Backup
pg_dump -U election_user election_hub > backup.sql

# Restore
psql -U election_user election_hub < backup.sql
```

## 🔍 Monitoring & Logging

### Logging Strategy

```typescript
// Use Winston or Pino for production logging
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
```

### Health Check Endpoint

```typescript
// GET /api/health
{
  "status": "healthy",
  "database": "connected",
  "uptime": 3600,
  "timestamp": "2024-12-07T10:30:00Z"
}
```

## 🐛 Troubleshooting

### Issue: Database Connection Failed

**Solution:** Check `DATABASE_URL` in `.env` and ensure PostgreSQL is running.

### Issue: Prisma Generate Error

**Solution:** Run `npx prisma generate` after schema changes.

### Issue: JWT Token Invalid

**Solution:** Check `JWT_SECRET` matches between token generation and verification.

### Issue: CORS Error

**Solution:** Add frontend URL to CORS whitelist in `app.ts`.

### Issue: Migration Failed

**Solution:** Reset database with `npx prisma migrate reset` (WARNING: deletes data).

## 📚 API Documentation

### Generate API Docs

```bash
# Using Swagger/OpenAPI
pnpm run docs

# Access at http://localhost:5000/api-docs
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Write comprehensive JSDoc comments
3. Use Prisma for all database operations
4. Validate all inputs
5. Log all critical actions
6. Write tests for new features

## 📄 License

MIT License - see main project README

---

**Part of Election Hub - Ghana Election Results Management System**
