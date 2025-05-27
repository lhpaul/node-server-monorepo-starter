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
