# Monorepo Starter

This repository provides a robust foundation for developing a server-side application with a well-structured domain architecture.

This starter template is designed to be cloud platform and database independent, giving you the flexibility to choose your preferred infrastructure. For specialized implementations tailored to specific cloud providers, explore these extensions:

- [Google Cloud Platform (GCP)](https://github.com/lhpaul/node-server-monorepo-starter): A complete implementation leveraging [Firebase Authentication](https://firebase.google.com/docs/auth) for user authentication, [Cloud Firestore](https://firebase.google.com/docs/firestore) for data storage, and [Cloud Run](https://cloud.google.com/run) for serverless deployment.

## What's Inside?

This monorepo includes the following packages and applications:

### Apps and Packages

- `internal-api`: A [Fastify](https://fastify.dev/) application that provides a REST API and MCP server implementation. Designed for server-to-server communication with authentication via API keys or service accounts. Ideally it should be used in a internal network to ensure secure data transmission.
- `public-api`: A [Fastify](https://fastify.dev/) application that provides a REST API implementation. Designed for secure internet-facing access with robust authentication and authorization protocols such as OIDC.
- `@repo/configs`: Shared configuration files for ESLint, Jest, Prettier and TypeScript to ensure consistent code quality and style across all packages.
- `@repo/fastify`: Shared Fastify utilities and plugins providing common server functionality, middleware, and helper methods.
- `@repo/shared`: Shared business logic including domain models, services, interfaces and utilities used across all applications.

### Development Tools

This monorepo comes pre-configured with essential development tools:

- [PNPM](https://pnpm.io/) Fast, disk space efficient package manager.
- [Turborepo](https://turborepo.com/) for efficient monorepo management and shared library handling.
- [TypeScript](https://www.typescriptlang.org/) for robust type checking.
- [ESLint](https://eslint.org/) for code quality and consistency.
- [Prettier](https://prettier.io) for automated code formatting.

## Project Structure

```bash
.vscode/                   # VS Code workspace settings and configurations
apps/                      # Application source codes
contexts/                  # Documentation for developers and vibe coding to be used as context.
packages/                  # Shared packages and libraries
.gitignore                 # Git ignore rules for the project
.lintstagedrc.json         # Lint-staged configuration for pre-commit hooks
.markdownlint.json         # Markdown linting rules
.monorepo.code-workspace   # VS Code workspace configuration
package.json               # Root package.json for workspace configuration
pnpm-lock.yaml             # PNPM lock file for dependency versioning
pnpm-workspace.yaml        # PNPM workspace configuration
PROMPTS.md                 # AI prompt templates for development assistance
TODOs.md                   # Project roadmap and pending tasks
turbo.json                 # Turborepo configuration file
```

## Getting Started

### Setup

#### Prerequisites

Before you begin, ensure you have the following installed:

1. Node.js version 22 (we recommend using [nvm](https://github.com/nvm-sh/nvm) for version management)
2. [pnpm](https://pnpm.io/installation) package manager.
3. Turborepo CLI globally installed:

   ```bash
   pnpm install turbo --global
   ```

#### Installation

Install all repository dependencies by running:

```bash
pnpm install
```

### Build

The build process will create optimized production bundles in the `dist` directory of each package.

To build all applications and packages in the monorepo:

```bash
# Build for production (with optimizations)
pnpm build
```

You can also build individual packages or applications by navigating to their respective directories:

```bash
# Example: Building a shared package
cd packages/shared
pnpm run build

# Example: Building a specific application
cd apps/public-api
pnpm run build
```

### Development

This project contains multiple applications that can be run independently. For development, we use development builds that support hot-reloading and provide better debugging capabilities.

To start development, choose one of the following applications:

#### Internal API

```bash
pnpm run dev:internal-api
```

#### Public API

```bash
pnpm run dev:public-api
```

> **Note**: Each application may require specific environment variables to function properly. Check the `.env.example` file in each application's directory and create a `.env` file with the required variables before starting the development server.

### Testing

The project uses Jest as the testing framework. Here's how to run tests:

#### Running All Tests

To run tests across all apps and packages from the root directory:

```bash
pnpm run test
```

#### Running Specific Tests

To run tests for a specific app or package:

1. Navigate to the target directory:

```bash
cd packages/shared  # or any other package/app directory
```

2. Run the tests:

```bash
pnpm run test
```

#### Test Coverage

Each package and app generates test coverage reports. To view detailed coverage information:

1. Navigate to the package/app directory
2. Open `coverage/lcov-report/index.html` in your browser

## Project Conventions

Before starting a new development, please review the [Project Conventions] documentation inside the `/contexts` folder. Following these guidelines helps ensure consistency, maintainability, and smoother code reviews during Pull Requests.

## Additional Resources

Explore more Turborepo features:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request from your branch to `main`.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions or feedback, please contact [lhpaul11@gmail.com](mailto:lhpaul11@gmail.com).
