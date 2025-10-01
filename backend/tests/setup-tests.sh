#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Ghana Elections API - Test Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Create directories
echo -e "${GREEN}Creating test directories...${NC}"
mkdir -p tests/helpers
mkdir -p tests/integration
mkdir -p tests/unit

# Create jest.config.js
echo -e "${GREEN}Creating jest.config.js...${NC}"
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
};
EOF

# Create tests/setup.ts
echo -e "${GREEN}Creating tests/setup.ts...${NC}"
cat > tests/setup.ts << 'EOF'
import prisma from '../src/utils/prisma';

beforeEach(async () => {
  await prisma.auditLog.deleteMany();
  await prisma.result.deleteMany();
  await prisma.pollingStation.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.constituency.deleteMany();
  await prisma.party.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
EOF

# Create tests/helpers/testData.ts
echo -e "${GREEN}Creating tests/helpers/testData.ts...${NC}"
cat > tests/helpers/testData.ts << 'EOF'
import prisma from '../../src/utils/prisma';
import bcrypt from 'bcryptjs';
import { Role, CandidateType, Region } from '@prisma/client';

export async function createTestUser(role: Role = Role.POLLING_OFFICER) {
  const hashedPassword = await bcrypt.hash('password123', 10);
  return prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      password: hashedPassword,
      role,
    },
  });
}

export async function createTestParty() {
  return prisma.party.create({
    data: {
      name: `Test Party ${Date.now()}`,
      abbreviation: `TP${Date.now()}`,
      color: '#FF0000',
    },
  });
}

export async function createTestConstituency() {
  return prisma.constituency.create({
    data: {
      name: `Test Constituency ${Date.now()}`,
      region: Region.GREATER_ACCRA,
    },
  });
}

export async function createTestCandidate(
  partyId: string,
  type: CandidateType = CandidateType.PRESIDENTIAL,
  constituencyId?: string
) {
  return prisma.candidate.create({
    data: {
      name: `Test Candidate ${Date.now()}`,
      type,
      partyId,
      constituencyId,
    },
  });
}

export async function createTestPollingStation(constituencyId: string) {
  return prisma.pollingStation.create({
    data: {
      name: `Test Station ${Date.now()}`,
      code: `TS-${Date.now()}`,
      location: 'Test Location',
      constituencyId,
    },
  });
}
EOF

# Create tests/helpers/auth.ts
echo -e "${GREEN}Creating tests/helpers/auth.ts...${NC}"
cat > tests/helpers/auth.ts << 'EOF'
import { generateToken } from '../../src/utils/jwt';
import { Role } from '@prisma/client';

export function generateTestToken(userId: string, email: string, role: Role): string {
  return generateToken(userId, email, role);
}

export function getAuthHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
EOF

# Create tests/integration/auth.test.ts
echo -e "${GREEN}Creating tests/integration/auth.test.ts...${NC}"
cat > tests/integration/auth.test.ts << 'EOF'
import request from 'supertest';
import app from '../../src/app';
import { createTestUser } from '../helpers/testData';
import { generateTestToken, getAuthHeader } from '../helpers/auth';
import { Role } from '@prisma/client';

describe('Auth Endpoints', () => {
  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.id).toBe(user.id);
    });

    it('should reject incorrect password', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user.id, user.email, user.role);

      const response = await request(app)
        .get('/api/auth/me')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe(user.email);
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
    });
  });
});
EOF

# Create tests/integration/results.test.ts
echo -e "${GREEN}Creating tests/integration/results.test.ts...${NC}"
cat > tests/integration/results.test.ts << 'EOF'
import request from 'supertest';
import app from '../../src/app';
import {
  createTestUser,
  createTestParty,
  createTestConstituency,
  createTestCandidate,
  createTestPollingStation,
} from '../helpers/testData';
import { generateTestToken, getAuthHeader } from '../helpers/auth';
import { Role, CandidateType } from '@prisma/client';

describe('Results Endpoints', () => {
  let token: string;
  let candidateId: string;
  let pollingStationId: string;

  beforeEach(async () => {
    const user = await createTestUser(Role.POLLING_OFFICER);
    token = generateTestToken(user.id, user.email, user.role);

    const party = await createTestParty();
    const constituency = await createTestConstituency();
    const candidate = await createTestCandidate(party.id);
    const station = await createTestPollingStation(constituency.id);

    candidateId = candidate.id;
    pollingStationId = station.id;
  });

  describe('POST /api/results', () => {
    it('should submit a result with valid data', async () => {
      const response = await request(app)
        .post('/api/results')
        .set(getAuthHeader(token))
        .send({
          candidateId,
          pollingStationId,
          votes: 250,
        });

      expect(response.status).toBe(201);
      expect(response.body.votes).toBe(250);
    });

    it('should reject submission without authentication', async () => {
      const response = await request(app)
        .post('/api/results')
        .send({
          candidateId,
          pollingStationId,
          votes: 250,
        });

      expect(response.status).toBe(401);
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/results')
        .set(getAuthHeader(token))
        .send({
          candidateId,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/results/presidential', () => {
    it('should return aggregated presidential results', async () => {
      const response = await request(app).get('/api/results/presidential');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalVotes');
      expect(response.body).toHaveProperty('results');
    });
  });
});
EOF

# Create .env.test
echo -e "${GREEN}Creating .env.test...${NC}"
cat > .env.test << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/elections_test?schema=public"
JWT_SECRET="test-secret-key"
JWT_EXPIRES_IN="1d"
NODE_ENV="test"
PORT=5001
EOF

# Create README.test.md
echo -e "${GREEN}Creating README.test.md...${NC}"
cat > README.test.md << 'EOF'
# Testing Guide

## Setup

1. Create test database:
```bash
createdb elections_test
```

2. Install dependencies:
```bash
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
```

3. Run migrations on test database:
```bash
NODE_ENV=test npx prisma migrate deploy
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.ts
```

## Test Structure

- `tests/setup.ts` - Global test setup
- `tests/helpers/` - Test utilities and factories
- `tests/integration/` - API endpoint tests
- `tests/unit/` - Unit tests for utilities

## Writing Tests

Use the helper functions in `tests/helpers/testData.ts` to create test data:

```typescript
import { createTestUser, createTestParty } from '../helpers/testData';

const user = await createTestUser(Role.ADMIN);
const party = await createTestParty();
```
EOF

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Test setup complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Install dependencies:"
echo -e "   ${GREEN}npm install --save-dev jest ts-jest @types/jest supertest @types/supertest${NC}"
echo -e "\n2. Create test database:"
echo -e "   ${GREEN}createdb elections_test${NC}"
echo -e "\n3. Run migrations:"
echo -e "   ${GREEN}NODE_ENV=test npx prisma migrate deploy${NC}"
echo -e "\n4. Run tests:"
echo -e "   ${GREEN}npm test${NC}\n"

echo -e "${BLUE}Add these scripts to your package.json:${NC}"
echo -e '  "test": "NODE_ENV=test jest --runInBand",'
echo -e '  "test:watch": "NODE_ENV=test jest --watch --runInBand",'
echo -e '  "test:coverage": "NODE_ENV=test jest --coverage --runInBand"'
echo ""