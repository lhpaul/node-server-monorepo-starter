# Monorepo Starter - Google Cloud

This repository provides a robust foundation for developing server-side applications with a well-structured domain architecture.

## Table of Contents

- [Overview](#overview)
- [What's Inside?](#whats-inside)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup & Authentication](#setup--authentication)
  - [Installation](#installation)
- [Development](#development)
- [Build](#build)
- [Testing](#testing)
- [Project Conventions](#project-conventions)
- [Additional Resources](#additional-resources)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

This implementation leverages:

- [Firebase Authentication](https://firebase.google.com/docs/auth) for user authentication
- [Cloud Firestore](https://firebase.google.com/docs/firestore) for data storage
- [Cloud Run](https://cloud.google.com/run) for serverless deployment
- [Cloud Functions](https://cloud.google.com/functions?hl=en) for:
  - [Firestore Triggers](https://firebase.google.com/docs/firestore/extend-with-functions)
  - [Pub/Sub Events](https://firebase.google.com/docs/functions/pubsub-events?gen=2nd)
  - [Scheduled Functions](https://firebase.google.com/docs/functions/schedule-functions?gen=2nd)

## What's Inside?

### Applications

- **internal-api**: [Fastify](https://fastify.dev/) REST API & MCP server for internal, server-to-server communication (API keys/service accounts).
- **public-api**: [Fastify](https://fastify.dev/) REST API for public/OIDC access using [Firebase Authentication](https://firebase.google.com/docs/auth).
- **functions**: [Firebase Functions](https://firebase.google.com/docs/functions) for Firestore, Pub/Sub, and Scheduler triggers.
- **firestore**: Firestore configuration for [rules](https://firebase.google.com/docs/firestore/security/get-started#use_the_cli) and [indexes](https://firebase.google.com/docs/firestore/query-data/indexing#use_the_firebase_cli).

### Packages

- **@repo/configs**: Shared ESLint, Jest, Prettier, and TypeScript configs.
- **@repo/fastify**: Shared Fastify utilities and plugins.
- **@repo/shared**: Shared business logic, domain models, services, interfaces, and utilities.

### Development Tools

This monorepo comes pre-configured with essential development tools:

- [PNPM](https://pnpm.io/) Fast, disk space efficient package manager.
- [Turborepo](https://turborepo.com/) for efficient monorepo management and shared library handling.
- [TypeScript](https://www.typescriptlang.org/) for robust type checking.
- [ESLint](https://eslint.org/) for code quality and consistency.
- [Prettier](https://prettier.io) for automated code formatting.
- [Lint Staged](https://github.com/lint-staged/lint-staged) for running tasks on staged files instead of the whole project.
- [Firebase Tools](https://firebase.google.com/docs/cli) for managing firebase products.
- [Isolate](https://www.npmjs.com/package/isolate-package/v/1.4.1-0) needed for deploying cloud functions.

## Project Structure

```bash
.vscode/                   # VS Code workspace settings
apps/                      # Application source code
contexts/                  # Project conventions & documentation
packages/                  # Shared packages and libraries
.firebaserc                # Firebase projects config
.gitignore                 # Git ignore rules
.lintstagedrc.json         # Lint-staged config
.markdownlint.json         # Markdown linting rules
firebase.json              # Firebase config
isolate.config.json        # Isolate package config
monorepo.code-workspace    # VS Code workspace config
package.json               # Root package.json
pnpm-lock.yaml             # PNPM lock file
pnpm-workspace.yaml        # PNPM workspace config
PROMPTS.md                 # AI prompt templates
TODOs.md                   # Roadmap & pending tasks
turbo.json                 # Turborepo config
```

## Getting Started

### Prerequisites

- Node.js **v22** ([nvm recommended](https://github.com/nvm-sh/nvm))
- [pnpm](https://pnpm.io/installation)
- [Turborepo CLI](https://turborepo.com/) (`pnpm install turbo --global`)
- [Google Cloud CLI (gcloud)](https://cloud.google.com/sdk/docs/install)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- Access to at least the development environment Google Cloud project

### Setup & Authentication

1. **Install Google Cloud CLI:** [Guide](https://cloud.google.com/sdk/docs/install)
2. **Authenticate with Google Cloud:**

   ```bash
   gcloud auth login
   ```

3. **Authenticate with Firebase:**

   ```bash
   firebase login
   ```

4. **Configure Projects:**
   - Add your Google Cloud project IDs to `.firebaserc`.

### Installation

Install all dependencies:

```bash
pnpm install
```

## Development

Each application can be run independently. Use the following commands from the root:

- **Internal API:**

  ```bash
  pnpm run dev:internal-api
  ```

- **Public API:**

  ```bash
  pnpm run dev:public-api
  ```

> **Note:** Each app may require environment variables. Copy `.env.example` to `.env` in each app directory and fill in required values.

- **Functions:**
  - Deploy all functions:

    ```bash
    pnpm run deploy:functions
    ```

  - Deploy a specific function:

    ```bash
    turbo run build --parallel && firebase deploy --only functions:{function-name}
    ```

    - Function names follow `{functionType}-{functionName}` (e.g., `firestore-transactionUpdateRequestOnWrite`).

- **Firestore:**
  - Deploy rules:

    ```bash
    pnpm run deploy:firestore:rules
    ```

  - Deploy indexes:

    ```bash
    pnpm run deploy:firestore:indexes
    ```

  - Deploy both:

    ```bash
    pnpm run deploy:firestore
    ```

## Build

Build all apps and packages:

```bash
pnpm build
```

Or build individually:

```bash
cd packages/shared      # or any app/package
pnpm run build
```

## Testing

Run all tests from the root:

```bash
pnpm run test
```

Run tests for a specific app/package:

```bash
cd packages/shared  # or any app/package
pnpm run test
```

**Test Coverage:**

- Coverage reports are generated in `coverage/lcov-report/index.html` in each app/package.

## Project Conventions

Before starting development, review the [Project Conventions](./contexts/) in the `/contexts` folder. Following these guidelines ensures consistency and smoother code reviews.

## Troubleshooting

Each application has its own README file in its directory where you can find detailed information about the application, including troubleshooting guides for common problems.

### Common Issues

- **Permission Denied on Deployment**: If you encounter permission errors during deployment, you may need to unset service account impersonation. See the individual application READMEs for specific solutions.

- **Build Failures**: Ensure all dependencies are installed and TypeScript configurations are properly set up.

- **Test Failures**: Check that test environments are properly configured and all required services are running.

For application-specific troubleshooting, refer to:

- [Internal API README](./apps/internal-api/README.md)
- [Public API README](./apps/public-api/README.md)
- [Functions README](./apps/functions/README.md)
- [Firestore README](./apps/firestore/README.md)

## Additional Resources

- [Turborepo](https://turborepo.com/)
   - [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
   - [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
   - [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
   - [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
   - [Configuration Options](https://turborepo.com/docs/reference/configuration)
   - [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
- [Firebase](https://firebase.google.com/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request to the branch you checked out from.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions or feedback, contact [lhpaul11@gmail.com](mailto:lhpaul11@gmail.com).
