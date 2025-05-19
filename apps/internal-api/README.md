# Internal API

A [Fastify](https://fastify.dev/) application that provides a REST API and MCP server implementation. Designed for server-to-server communication with authentication via API keys or service accounts. Ideally it should be used in a internal network to ensure secure data transmission.

## Structure

```bash
src/
├── constants/        # Global constants used throughout the project
├── definitions/      # TypeScript definitions, interfaces and types for type safety
├── mcp/              # Model Context Protocol (MCP) server implementation and resources
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
