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
