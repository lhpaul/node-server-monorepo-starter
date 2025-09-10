# Public API

A [Fastify](https://fastify.dev/) application that provides a REST API implementation. Designed for secure internet-facing access with robust authentication and authorization protocols such as OIDC.

## Structure

```bash
src/
├── constants/        # Global constants used throughout the project
├── definitions/      # TypeScript definitions, interfaces and types for type safety
├── endpoints/        # Api endpoints configurations and handlers
├── services/         # Business logic and service layer implementations
├── utils/            # Reusable utility functions
├── index.ts          # Main application entry point
├── routes.ts         # API route definitions and handlers
└── server.ts         # Server configuration and initialization
.eslintrc.js          # ESLint linting rules
.prettierrc.js        # Prettier linting rules
jest.config.ts        # Jest configuration file
package.json          # Workspace configuration
tsconfig.json         # Typescript configuration
```

## Development Setup

1. Create a `.env` file in the root directory by copying `.env.example`:

   ```bash
   cp .env.example .env
   ```

2. Update the environment variables in `.env` with your local development values.

> Note: Make sure to never commit the `.env` file to version control as it may contain sensitive information.

## Secret Management

Currently, because the deployment is cloud-agnostic, secrets are managed using environment variables.

### How Secrets Work

Secrets are accessed in the application as regular environment variables. The `getSecret` utility function from `@repo/shared` provides a safe way to access these values with proper error handling.

```typescript
   import { getSecret } from '@repo/shared';

   const apiKey = getSecret('EXTERNAL_API_KEY');
```

   > **Note**: Always use the `getSecret` utility function from `@repo/shared` instead of directly accessing `process.env`. This utility provides proper error handling and ensures the secret exists.

### Adding a New Secret

When you need to add a new secret to the application, follow these steps:

#### Step 1: Define the Secret Constant

First, add your new secret to the `SECRETS` constant in the shared package:

```typescript
// packages/shared/src/constants/secrets.constants.ts
export const SECRETS = {
  // ... existing secrets
  DATABASE_PASSWORD: 'DATABASE_PASSWORD',
} as const;
```

#### Step 2: Create Environment Files

Create a `.env.example` file in the public-api directory (if it doesn't exist) and add your secret:

```bash
# apps/public-api/.env.example
# ... existing secrets and environment variables
DATABASE_PASSWORD= # Add your new secret here (leave value blank for documentation)
```

Then create your local `.env` file with actual values:

```bash
# apps/public-api/.env
# ... existing secrets and environment variables
# Add your actual secret value here
DATABASE_PASSWORD=my-secure-db-password
```

#### Step 3: Update Environment Schema

Update the `FASTIFY_ENV_SCHEMA` in the server constants to validate the new secret:

```typescript
// apps/public-api/src/constants/server.constants.ts
import { ENV_VARIABLES_KEYS, SECRETS } from '@repo/shared/constants';

export const FASTIFY_ENV_SCHEMA = {
  // ... existing properties
  [SECRETS.DATABASE_PASSWORD]: { type: 'string' },
  // ... existing required fields
  SECRETS.DATABASE_PASSWORD,
} as const;
```

#### Step 4: Use the Secret in Your Code

Access your secret using the `getSecret` utility function:

```typescript
import { getSecret } from '@repo/shared';
import { SECRETS } from '@repo/shared/constants';

const dbPassword = getSecret(SECRETS.DATABASE_PASSWORD);
// Use dbPassword in your database connection

### Security Best Practices

- Never commit secret values to version control in the `.env` file
- Use descriptive names for secrets that indicate their purpose